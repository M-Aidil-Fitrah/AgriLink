import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getFreshnessScore } from "@/lib/metrics";
import Link from "next/link";
import { DeleteProductButton } from "./DeleteProductButton";
import { Package, Plus, Pencil } from "lucide-react";
import { CultivationMethod, Product as PrismaProduct } from "@prisma/client";
import Image from "next/image";

type Product = PrismaProduct & { images: string[] };

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
    <div className="p-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Produk Saya</h2>
          <p className="text-gray-500 font-medium mt-1">
            {products.length} produk terdaftar di katalog
          </p>
        </div>
        <Link
          href="/dashboard/farmer-produk/tambah"
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload Produk
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-24 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold text-lg">Belum ada produk</p>
          <p className="text-gray-400 text-sm mt-2">Mulai upload produk untuk mulai berjualan</p>
          <Link
            href="/dashboard/farmer-produk/tambah"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Produk Pertama
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Produk</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Harga</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Metode</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kesegaran</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const freshness = getFreshnessScore(product.harvestDate);
                const hasLocation = product.latitude != null && product.longitude != null;

                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                          <Image
                            src={
                              (product as Product).images?.[0] ||
                              "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=100"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{product.origin || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-sm">
                        Rp {product.price.toLocaleString("id-ID")}
                        <span className="text-gray-400 font-medium ml-1">/{product.unit}</span>
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                          product.stock > 10
                            ? "text-emerald-700 bg-emerald-50"
                            : product.stock > 0
                            ? "text-amber-700 bg-amber-50"
                            : "text-red-700 bg-red-50"
                        }`}
                      >
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-gray-600">
                        {CULTIVATION_LABELS[product.cultivationMethod]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.harvestDate ? (
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${freshness.color}`}>
                          {freshness.score}/100
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {hasLocation ? (
                        <span className="text-xs font-semibold text-emerald-600">Terpasang</span>
                      ) : (
                        <span className="text-xs text-gray-400">Belum diatur</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/dashboard/farmer-produk/${product.id}/edit`}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
