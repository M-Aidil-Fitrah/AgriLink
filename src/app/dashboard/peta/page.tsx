import { getStoreLocations } from "@/app/actions/productActions";
import { DynamicMap } from "@/components/dashboard/DynamicMap";

export default async function PetaPage() {
  const storeLocations = await getStoreLocations();

  return (
    <div className="h-[calc(100vh-80px)] p-6">
      <div className="h-full bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold text-gray-900">Peta Sebaran Petani</h2>
          <p className="text-sm text-gray-500 font-medium">Temukan lokasi petani lokal di sekitar Anda dan lihat produk segar yang mereka tawarkan.</p>
        </div>
        <div className="flex-1 relative">
          <DynamicMap markers={storeLocations} />
        </div>
      </div>
    </div>
  );
}
