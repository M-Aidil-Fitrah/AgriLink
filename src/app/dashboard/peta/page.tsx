import { getStoreLocations } from "@/app/actions/productActions";
import { DynamicMap } from "@/components/dashboard/DynamicMap";

export default async function PetaPage() {
  const storeLocations = await getStoreLocations();

  return (
    <div className="h-[calc(100dvh-4rem)] md:h-[calc(100dvh-5rem)] p-2 md:p-6">
      <div className="h-full bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 py-3 md:p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-lg md:text-2xl font-extrabold text-gray-900">
            Peta Sebaran Toko
          </h2>
          <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">
            Temukan lokasi toko petani lokal di sekitar Anda dan lihat produk segar yang mereka tawarkan.
          </p>
        </div>
        <div className="flex-1 relative min-h-0">
          <DynamicMap markers={storeLocations} />
        </div>
      </div>
    </div>
  );
}
