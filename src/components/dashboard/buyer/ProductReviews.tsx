"use client";

import { useState, useTransition } from "react";
import { Star, Send, Loader2, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { submitReview } from "@/app/actions/reviewActions";
import { ReviewWithUser } from "@/lib/types";
import Image from "next/image";
import { toast } from "react-hot-toast";

const REVIEWS_PER_PAGE = 5;

type ProductReviewsProps = {
  productId: string;
  reviews: ReviewWithUser[];
  currentUserId: string | null;
  hasDeliveredOrder: boolean;
};

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass =
    size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-7 h-7" : "w-5 h-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = readonly ? star <= value : star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-all ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          >
            <Star
              className={`${sizeClass} transition-colors ${
                filled
                  ? "fill-amber-400 stroke-amber-400"
                  : "fill-gray-100 stroke-gray-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewWithUser }) {
  const initials = (review.user.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex gap-3 py-4 border-b border-gray-50 last:border-0">
      <div className="shrink-0">
        {review.user.image ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={review.user.image}
              alt={review.user.name ?? "User"}
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-[10px] font-extrabold text-emerald-700">
              {initials}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs font-bold text-gray-900 truncate">
            {review.user.name ?? "Pengguna"}
          </p>
          <p className="text-[10px] text-gray-400 font-medium shrink-0">
            {new Date(review.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <StarRating value={review.rating} readonly size="sm" />
        {review.comment && (
          <p className="text-[11px] text-gray-600 font-medium leading-relaxed mt-1.5">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
}

export function ProductReviews({
  productId,
  reviews,
  currentUserId,
  hasDeliveredOrder,
}: ProductReviewsProps) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const existingReview = reviews.find((r) => r.user.id === currentUserId);
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(totalReviews / REVIEWS_PER_PAGE));
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  // Rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Pilih rating bintang terlebih dahulu");
      return;
    }
    startTransition(async () => {
      const result = await submitReview({ productId, rating, comment });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          existingReview ? "Ulasan berhasil diperbarui!" : "Ulasan berhasil dikirim!"
        );
        setSubmitted(true);
        setRating(0);
        setComment("");
      }
    });
  };

  return (
    <div className="pt-4 border-t border-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <h3 className="font-bold text-gray-900 text-[10px] tracking-widest uppercase opacity-40">
          Ulasan Pembeli
        </h3>
      </div>

      {/* Summary */}
      {totalReviews > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 mb-4">
          {/* Average score */}
          <div className="flex flex-col items-center justify-center px-4 shrink-0">
            <span className="text-4xl font-black text-gray-900">
              {averageRating.toFixed(1)}
            </span>
            <StarRating value={Math.round(averageRating)} readonly size="sm" />
            <span className="text-[10px] text-gray-400 font-semibold mt-1">
              {totalReviews} ulasan
            </span>
          </div>

          {/* Bar distribution */}
          <div className="flex-1 space-y-1.5 justify-center flex flex-col">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 w-3 text-right">
                  {star}
                </span>
                <Star className="w-3 h-3 fill-amber-400 stroke-amber-400 shrink-0" />
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{
                      width:
                        totalReviews > 0
                          ? `${(count / totalReviews) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-gray-400 w-3">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review form */}
      {currentUserId ? (
        hasDeliveredOrder ? (
          !submitted ? (
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 mb-4 space-y-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                {existingReview ? "Perbarui Ulasan Anda" : "Tulis Ulasan"}
              </p>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 font-semibold">
                  Rating
                </label>
                <StarRating
                  value={rating === 0 && existingReview ? existingReview.rating : rating}
                  onChange={setRating}
                  size="lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 font-semibold">
                  Komentar{" "}
                  <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <textarea
                  value={comment === "" && existingReview ? (existingReview.comment ?? "") : comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Bagikan pengalaman Anda dengan produk ini..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white rounded-xl border border-gray-200 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                {isPending
                  ? "Mengirim..."
                  : existingReview
                    ? "Perbarui Ulasan"
                    : "Kirim Ulasan"}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-4 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs font-semibold text-emerald-700">
                Ulasan Anda telah dikirim. Halaman akan diperbarui secara otomatis.
              </p>
            </div>
          )
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mb-4 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Ulasan hanya dapat diberikan setelah pesanan produk ini diterima
              (status{" "}
              <span className="font-bold text-gray-700">Delivered</span>).
            </p>
          </div>
        )
      ) : (
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mb-4">
          <p className="text-[11px] text-gray-500 font-medium">
            <a href="/login" className="text-emerald-600 font-bold hover:underline">
              Masuk
            </a>{" "}
            untuk memberikan ulasan pada produk ini.
          </p>
        </div>
      )}

      {/* Review list */}
      {totalReviews === 0 ? (
        <div className="py-8 text-center">
          <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-xs text-gray-400 font-semibold">
            Belum ada ulasan. Jadilah yang pertama!
          </p>
        </div>
      ) : (
        <>
          <div>
            {paginatedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-gray-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-emerald-50"
              >
                <ChevronLeft className="w-3 h-3" />
                Sebelumnya
              </button>

              <span className="text-[10px] font-bold text-gray-400">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-gray-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-emerald-50"
              >
                Selanjutnya
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
