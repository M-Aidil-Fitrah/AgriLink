import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Package, Heart, TreePine, Star, TrendingUp } from "lucide-react";
import { Product } from "@prisma/client";

export default async function FarmerDashboard() {
  const session = await auth();
  if (!session) return null;

  const [products, orders] = await Promise.all([
    prisma.product.findMany({ where: { farmerId: session.user.id } }),
    prisma.order.findMany({ where: { items: { some: { product: { farmerId: session.user.id } } } } })
  ]);
  
  const userName = session.user.name?.split(" ")[0] || "Petani";
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="p-8 pb-20">
      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full">
        <div className="w-full relative rounded-3xl p-8 overflow-hidden bg-emerald-900 text-white">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-linear-to-r from-transparent to-emerald-800" />
          <h2 className="text-3xl font-extrabold relative z-10">
            Selamat datang kembali, <span className="text-emerald-400">{userName}!</span>
          </h2>
          <p className="text-emerald-50 mt-2 font-medium relative z-10 max-w-sm">
            Pantau penjualan Anda, kelola hasil kebun, dan berikan yang terbaik langsung tanpa perantara ke meja makan pembeli.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
               <TrendingUp className="w-6 h-6" />
           </div>
           <p className="text-sm font-bold text-gray-500">Total Pendapatan</p>
           <h3 className="text-2xl font-black text-gray-900 mt-1">Rp {totalRevenue.toLocaleString("id-ID")}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
               <Package className="w-6 h-6" />
           </div>
           <p className="text-sm font-bold text-gray-500">Produk Anda</p>
           <h3 className="text-2xl font-black text-gray-900 mt-1">{products.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
               <TreePine className="w-6 h-6" />
           </div>
           <p className="text-sm font-bold text-gray-500">Pesanan Masuk</p>
           <h3 className="text-2xl font-black text-gray-900 mt-1">{orders.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Katalog Produk Anda</h3>
            <button className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700">
               + Upload Produk
            </button>
         </div>

         {products.length > 0 ? (
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="pb-3 font-semibold">Nama Produk</th>
                  <th className="pb-3 font-semibold">Harga</th>
                  <th className="pb-3 font-semibold">Stok</th>
                  <th className="pb-3 font-semibold">Tanggal Panen</th>
               </tr>
             </thead>
             <tbody>
               {products.map((p) => (
                 <tr key={p.id} className="border-b border-gray-50 text-sm font-medium">
                    <td className="py-4 text-gray-900">{p.name}</td>
                    <td className="py-4 text-emerald-600">Rp {p.price}</td>
                    <td className="py-4 text-gray-900">{p.stock}</td>
                    <td className="py-4 text-gray-500">{p.harvestDate ? new Date(p.harvestDate).toLocaleDateString("id-ID") : "-"}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         ) : (
           <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <p className="text-gray-500 font-medium">Anda belum mengunggah produk apapaun.</p>
           </div>
         )}
      </div>
    </div>
  );
}
