import { ProductForm } from "@/components/dashboard/farmer/ProductForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TambahProdukPage() {
  const session = await auth();
  if (!session || session.user.role !== "FARMER") redirect("/dashboard");
  return (
    <div className="p-8 pb-20">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Upload Produk Baru</h2>
      <ProductForm />
    </div>
  );
}
