"use client";

import { useTransition, useState } from "react";
import { deleteProduct } from "@/app/actions/productActions";
import { Trash2 } from "lucide-react";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`Hapus produk "${productName}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (!result.success) setError(result.error);
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
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </>
  );
}
