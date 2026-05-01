"use server";

import { midtransCore } from "@/lib/midtrans";
import { auth } from "@/auth";

import { MidtransChargeResponse } from "@/lib/midtrans-types";

export async function createMidtransTransactionAction(data: {
  orderId: string;
  grossAmount: number;
  paymentMethod: string;
  customerDetails: {
    firstName: string;
    email: string;
    phone?: string;
  };
  items: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }[];
}) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const parameter: Record<string, unknown> = {
      payment_type: "",
      transaction_details: {
        order_id: data.orderId,
        gross_amount: data.grossAmount,
      },
      customer_details: {
        first_name: data.customerDetails.firstName,
        email: data.customerDetails.email,
        phone: data.customerDetails.phone,
      },
      item_details: data.items.map(item => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name.substring(0, 50),
      })),
    };

    // Map payment methods to Midtrans API
    switch (data.paymentMethod) {
      case "bca_va":
        parameter.payment_type = "bank_transfer";
        parameter.bank_transfer = { bank: "bca" };
        break;
      case "bni_va":
      case "bca_bni": 
        parameter.payment_type = "bank_transfer";
        parameter.bank_transfer = { bank: "bni" };
        break;
      case "mandiri":
        parameter.payment_type = "echannel";
        parameter.echannel = {
          bill_info1: "Payment:",
          bill_info2: "Online Purchase",
        };
        break;
      case "qris":
        parameter.payment_type = "qris";
        parameter.qris = { acquirer: "gopay" };
        break;
      case "gopay":
        parameter.payment_type = "gopay";
        break;
      case "shopeepay":
        parameter.payment_type = "shopeepay";
        break;
      case "indomaret":
        parameter.payment_type = "cstore";
        parameter.cstore = {
          store: "indomaret",
          message: "Payment for AgriLink Order",
        };
        break;
      case "alfamart":
        parameter.payment_type = "cstore";
        parameter.cstore = {
          store: "alfamart",
          message: "Payment for AgriLink Order",
        };
        break;
      default:
        // Try to handle as generic bank transfer if it ends with _va
        if (data.paymentMethod.endsWith("_va")) {
          const bank = data.paymentMethod.split("_")[0];
          parameter.payment_type = "bank_transfer";
          parameter.bank_transfer = { bank };
        } else {
          return { success: false, error: "Metode pembayaran tidak didukung saat ini." };
        }
        break;
    }

    const response = (await midtransCore.charge(parameter)) as MidtransChargeResponse;
    return { success: true, data: response };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("MIDTRANS_CHARGE_ERROR:", err);
    return { success: false, error: err.message || "Gagal menghubungi Midtrans" };
  }
}
