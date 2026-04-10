import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getFreshnessScore } from "@/lib/metrics";
import { FavoriteWithProduct } from "@/lib/types";
import { FavoriteButton } from "./FavoriteButton";
import { Heart } from "lucide-react";
import Image from "next/image";
import { Product as PrismaProduct } from "@prisma/client";

type ProductOverride = PrismaProduct & { images: string[]; farmer: { name: string; id: string } };

export async function FavoritView() {
  const session = await auth();
  if (!session) return null;

  const favorites = (await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          farmer: { select: { id: true, name: true, email: true, role: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })) as unknown as (Omit<FavoriteWithProduct, "product"> & { product: ProductOverride })[];

  return (
    <div className="p-8 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Produk Favorit</h2>
        <p className="text-gray-500 font-medium mt-1">
          {favorites.length} produk tersimpan
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="py-24 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold text-lg">Belum ada favorit</p>
          <p className="text-gray-400 text-sm mt-2">
            Simpan produk yang Anda sukai dengan menekan ikon hati
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {favorites.map(({ product, id }) => {
            const freshness = getFreshnessScore(product.harvestDate);

            return (
              <div
                key={id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              >
                <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                    <Image
                      src={
                        product.images?.[0] ||
                        "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=400"
                      }
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {product.harvestDate && (
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${freshness.color}`}
                      >
                        {freshness.score}/100 {freshness.label}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <FavoriteButton productId={product.id} initialFavorited={true} />
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">{product.farmer.name}</p>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <span className="text-base font-extrabold text-gray-900">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">/{product.unit}</span>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        product.stock > 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {product.stock > 0 ? `${product.stock} tersisa` : "Habis"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
