"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/actions/productActions";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Hapus produk "${productName}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (!result.success) {
        toast.error(result.error || "Gagal menghapus produk");
      } else {
        toast.success(`Produk "${productName}" berhasil dihapus`);
      }
    });
  }

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </>
  );
}
