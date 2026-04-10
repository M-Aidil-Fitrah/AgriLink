import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { FavoriteWithProduct } from "@/lib/types";
import { FavoriteButton } from "./FavoriteButton";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export async function FavoritView() {
  const session = await auth();
  if (!session) return null;

  const favorites = (await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          farmer: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })) as FavoriteWithProduct[];

  return (
    <div className="p-6 pb-20 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Favorit</h2>
        <p className="text-sm text-gray-500 font-medium">
          {favorites.length} produk pilihan
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <Heart className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Belum ada produk favorit</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {favorites.map(({ product, id }) => (
            <div key={id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col">
              <div className="relative w-full aspect-[16/11] bg-gray-100 overflow-hidden">
                <Link href={`/dashboard/produk/${product.id}`} className="block h-full">
                  <Image src={product.images?.[0] || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=300"} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                </Link>
                <div className="absolute top-2 right-2">
                  <FavoriteButton productId={product.id} initialFavorited={true} />
                </div>
              </div>

              <div className="p-3.5 flex flex-col flex-1">
                <Link href={`/dashboard/produk/${product.id}`} className="mb-3">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-emerald-600 truncate uppercase tracking-tight">{product.name}</h3>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mt-1 leading-none">{product.farmer.name}</p>
                </Link>
                
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-none">Harga</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-sm font-black text-emerald-700">Rp {product.price.toLocaleString("id-ID")}</span>
                      <span className="text-[9px] font-bold text-gray-400">/ {product.unit}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-tight ${product.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                    {product.stock > 0 ? "Tersedia" : "Habis"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
