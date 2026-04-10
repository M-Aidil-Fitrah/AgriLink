import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { DeleteProductButton } from "./DeleteProductButton";
import { Package, Plus, Pencil, MapPin } from "lucide-react";
import { CultivationMethod } from "@prisma/client";
import Image from "next/image";

const CULTIVATION_LABELS: Record<CultivationMethod, string> = {
  ORGANIC: "Organik",
  HYDROPONIC: "Hidroponik",
  CONVENTIONAL: "Konvensional",
  OTHER: "Lainnya",
};

export async function FarmerProdukView() {
  const session = await auth();
  if (!session) return null;

  const products = await prisma.product.findMany({
    where: { farmerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 pb-20 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Etalase Sayur</h2>
          <p className="text-sm text-gray-500 font-medium">
            {products.length} produk di katalog Anda
          </p>
        </div>
        <Link
          href="/dashboard/farmer-produk/tambah"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          TAMBAH PRODUK
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium tracking-tight uppercase">Belum ada produk aktif</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => {
            const hasLocation = product.latitude != null && product.longitude != null;

            return (
              <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col">
                <div className="relative w-full aspect-[16/11] overflow-hidden">
                  <Image
                    src={product.images?.[0] || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=300"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-bold text-emerald-800 uppercase shadow-sm">
                      {CULTIVATION_LABELS[product.cultivationMethod]}
                    </span>
                    {hasLocation && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase shadow-sm flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-white/50">
                      <p className="text-sm font-black text-gray-900 leading-none">{product.stock} {product.unit}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight uppercase truncate tracking-tight">
                      {product.name}
                    </h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-2">Update: {product.updatedAt.toLocaleDateString('id-ID')}</p>
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-gray-300 uppercase leading-none mb-1">Harga</p>
                      <p className="text-sm font-black text-gray-900">Rp {product.price.toLocaleString("id-ID")}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/dashboard/farmer-produk/${product.id}/edit`}
                        className="w-8 h-8 bg-gray-50 text-gray-400 flex items-center justify-center rounded-lg hover:bg-emerald-50 hover:text-emerald-600 border border-transparent hover:border-emerald-100 transition-all shadow-sm"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
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
