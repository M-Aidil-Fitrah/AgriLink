
export default function Loading() {
  return (
    <div className="h-full w-full min-h-[400px] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-t-emerald-600 rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Memuat Dashboard...</p>
    </div>
  );
}
