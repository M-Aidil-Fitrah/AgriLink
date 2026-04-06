import { ProductForm } from "@/components/dashboard/farmer/ProductForm";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

export default async function EditProdukPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session || session.user.role !== "FARMER") redirect("/dashboard");

  const product = await prisma.product.findFirst({
    where: { id: params.id, farmerId: session.user.id },
  });

  if (!product) notFound();

  return (
    <div className="p-8 pb-20">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Edit Produk</h2>
      <ProductForm product={product} />
    </div>
  );
}
