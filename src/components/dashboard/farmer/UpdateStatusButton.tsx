"use client";

import { useTransition, useState } from "react";
import { updateOrderStatus } from "@/app/actions/orderActions";
import { OrderStatus } from "@prisma/client";
import { Loader2, ChevronRight } from "lucide-react";

const STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  PROCESSING: "Proses Sekarang",
  SHIPPED: "Tandai Dikirim",
  DELIVERED: "Konfirmasi Selesai",
};

export function UpdateStatusButton({
  orderId,
  targetStatus,
}: {
  orderId: string;
  targetStatus: OrderStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, targetStatus);
      if (!result.success) setError(result.error);
    });
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        {STATUS_LABELS[targetStatus]}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
