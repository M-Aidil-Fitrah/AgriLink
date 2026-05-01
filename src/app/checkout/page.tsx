import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CheckoutView from "@/components/dashboard/buyer/CheckoutView";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Checkout | AgriLink",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const params = await searchParams;
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      locations: {
        where: { isPrimary: true },
        take: 1
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Handle Direct Buy
  let directBuyItem = null;
  const productId = params.productId as string | undefined;
  const quantity = parseInt(params.quantity as string || "1");

  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        farmer: {
          include: {
            sellerApplication: true
          }
        }
      }
    });

    if (product) {
      directBuyItem = {
        id: `direct-${product.id}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        images: product.images as string[],
        unit: product.unit,
        farmerId: product.farmerId,
        farmerName: product.farmer.sellerApplication?.businessName || product.farmer.name || "Petani"
      };
    }
  }

  const address = user.locations?.[0]?.address || "Jalan Jendral Sudirman No. 1, Jakarta";
  const name = user.name || "Customer";
  const phone = "0812-3456-XXXX"; // Masked for demo

  return (
    <CheckoutView 
      userName={name}
      userAddress={address}
      userPhone={phone}
      directBuyItem={directBuyItem}
    />
  );
}
