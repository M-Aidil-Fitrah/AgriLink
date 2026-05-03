import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { MidtransWebhookPayload } from "@/lib/midtrans-types";
import { createNotification } from "@/app/actions/notificationActions";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MidtransWebhookPayload;
    
    // 1. Verify Signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const signatureSource = body.order_id + body.status_code + body.gross_amount + serverKey;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(signatureSource)
      .digest("hex");

    if (body.signature_key !== expectedSignature) {
      console.error("MIDTRANS_WEBHOOK_INVALID_SIGNATURE");
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    let orderStatus: "PENDING" | "PAID" | "CANCELLED" | "EXPIRED" | "FAILED" = "PENDING";

    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        orderStatus = "PENDING";
      } else if (fraudStatus === "accept") {
        orderStatus = "PAID";
      }
    } else if (transactionStatus === "settlement") {
      orderStatus = "PAID";
    } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
      orderStatus = "CANCELLED";
    } else if (transactionStatus === "pending") {
      orderStatus = "PENDING";
    }

    if (orderStatus === "PAID") {
      // Update order in DB
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: "PROCESSING" }, 
        include: { 
          items: {
            include: { product: true }
          }
        }
      });

      // Notify Farmers
      const farmerIds = updatedOrder.items.map(item => item.product.farmerId);
      const uniqueFarmerIds = Array.from(new Set(farmerIds));
      
      for (const farmerId of uniqueFarmerIds) {
        await createNotification({
          userId: farmerId,
          title: "Pembayaran Diterima!",
          message: `Pesanan #${orderId.slice(-8).toUpperCase()} telah dibayar dan siap diproses.`,
          type: "ORDER",
          link: "/dashboard/pesanan"
        });
      }
    } else if (orderStatus === "CANCELLED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" }
      });
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("MIDTRANS_WEBHOOK_ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
