import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Package, Leaf, ArrowLeft, ChevronRight } from "lucide-react";
import { CultivationMethod } from "@prisma/client";
import { AddToCartButton } from "./AddToCartButton";
import { FavoriteButton } from "./FavoriteButton";

const CULTIVATION_LABELS: Record<CultivationMethod, string> = {
  ORGANIC: "Organik",
  HYDROPONIC: "Hidroponik",
  CONVENTIONAL: "Konvensional",
  OTHER: "Lainnya",
};

interface TokoDetailViewProps {
  sellerId: string;
}

export async function TokoDetailView({ sellerId }: TokoDetailViewProps) {
  const session = await auth();
  if (!session) return null;

  // Fetch seller application
  const seller = await prisma.sellerApplication.findUnique({
    where: { userId: sellerId, status: "APPROVED" },
    select: {
      userId: true,
      businessName: true,
      businessAddress: true,
      businessType: true,
      mainCommodity: true,
      description: true,
      businessPhotoUrl: true,
      latitude: true,
      longitude: true,
    },
  });

  if (!seller) notFound();

  // Fetch seller's active products
  const productsRaw = await prisma.product.findMany({
    where: { farmerId: sellerId, stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
  });

  const { supabaseServer } = await import("@/lib/supabaseServer");

  // Resolve seller business photo
  let sellerPhoto = seller.businessPhotoUrl;
  if (sellerPhoto && !sellerPhoto.startsWith("http")) {
    const { data: { publicUrl } } = supabaseServer.storage
      .from("agrilink-uploads")
      .getPublicUrl(sellerPhoto);
    sellerPhoto = publicUrl;
  }

  // Resolve product images
  const products = productsRaw.map((product) => {
    const images = (product.images as string[]).map((path) => {
      if (path.startsWith("http")) return path;
      const { data: { publicUrl } } = supabaseServer.storage
        .from("agrilink-uploads")
        .getPublicUrl(path);
      return publicUrl;
    });
    return { ...product, images };
  });

  // Fetch user favorites
  const userFavorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  const favoritedIds = new Set(userFavorites.map((f) => f.productId));

  return (
    <div className="p-6 pb-20 max-w-[1200px] mx-auto">
      {/* Back navigation */}
      <Link
        href="/dashboard/toko"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors mb-6 uppercase tracking-widest"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Semua Toko
      </Link>

      {/* Store Header Card - compact */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row">
          {/* Store Image */}
          <div className="relative w-full sm:w-48 h-36 shrink-0 bg-emerald-50">
            {sellerPhoto ? (
              <Image
                src={sellerPhoto}
                alt={seller.businessName}
                fill
                className="object-cover"
                sizes="192px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Leaf className="w-12 h-12 text-emerald-200" />
              </div>
            )}
          </div>

          {/* Store Info */}
          <div className="p-5 flex flex-col justify-center flex-1">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-md border border-emerald-100 mb-2">
                  {seller.businessType}
                </span>
                <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                  {seller.businessName}
                </h1>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Produk Aktif</p>
                <p className="text-2xl font-black text-gray-900">{products.length}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span className="text-xs font-semibold">{seller.businessAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Package className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span className="text-xs font-semibold">Komoditas: {seller.mainCommodity}</span>
              </div>
            </div>

            {seller.description && (
              <p className="text-xs text-gray-400 font-medium mt-3 line-clamp-2 leading-relaxed">
                {seller.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-6">
        <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">
          Produk dari {seller.businessName}
        </h2>
        <p className="text-xs text-gray-400 font-medium mt-0.5">
          {products.length} produk tersedia
        </p>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400 font-medium">Belum ada produk aktif dari toko ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => {
            const isFavorited = favoritedIds.has(product.id);
            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative w-full aspect-16/11 overflow-hidden">
                  <Link href={`/dashboard/produk/${product.id}`}>
                    <Image
                      src={
                        product.images[0] ||
                        "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=300"
                      }
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 20vw"
                    />
                  </Link>
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-bold text-emerald-800 uppercase tracking-wider shadow-sm border border-emerald-50">
                      {CULTIVATION_LABELS[product.cultivationMethod]}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <FavoriteButton productId={product.id} initialFavorited={isFavorited} />
                  </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1">
                  <Link href={`/dashboard/produk/${product.id}`} className="mb-3">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-emerald-600 transition-colors uppercase truncate tracking-tight">
                      {product.name}
                    </h3>
                    {product.origin && (
                      <div className="flex items-center gap-1 text-gray-500 mt-1.5">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <p className="text-[9px] font-bold truncate tracking-wide">{product.origin}</p>
                      </div>
                    )}
                  </Link>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Harga</p>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-sm font-black text-emerald-700">
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400">/ {product.unit}</span>
                      </div>
                    </div>
                    <AddToCartButton
                      item={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        images: product.images,
                        unit: product.unit,
                        farmerId: sellerId,
                        farmerName: seller.businessName,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Products Link */}
      {products.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            href={`/dashboard/produk?q=${encodeURIComponent(seller.businessName)}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-50 text-gray-600 font-bold text-xs rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-gray-100"
          >
            Lihat di Katalog Produk
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
