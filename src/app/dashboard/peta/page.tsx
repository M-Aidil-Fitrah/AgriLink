import { DynamicMap } from "@/components/dashboard/DynamicMap";

export default function PetaPage() {
  return (
    <div className="p-8 pb-20 h-[calc(100vh-80px)] flex flex-col">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Peta Produk</h2>
      <div className="flex-1 w-full bg-gray-100 rounded-3xl overflow-hidden relative">
        <DynamicMap />
      </div>
    </div>
  );
}
