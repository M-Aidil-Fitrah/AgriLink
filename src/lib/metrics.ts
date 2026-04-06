export function calculateFoodMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

export function getFoodMilesCategory(distance: number) {
  if (distance <= 10) return { label: "Sangat Dekat", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  if (distance <= 50) return { label: "Dekat", color: "text-emerald-500 bg-emerald-50 border-emerald-100" };
  if (distance <= 100) return { label: "Sedang", color: "text-amber-600 bg-amber-50 border-amber-200" };
  return { label: "Jauh", color: "text-red-500 bg-red-50 border-red-200" };
}

export function getFreshnessScore(harvestDate: Date | null) {
  if (!harvestDate) return { score: 0, label: "Tidak Diketahui", color: "text-gray-500 bg-gray-50" };
  
  const today = new Date();
  const diff = Math.max(0, Math.floor((today.getTime() - harvestDate.getTime()) / (1000 * 60 * 60 * 24)));
  const score = Math.max(0, 100 - diff * 10);
  
  if (score >= 90) return { score, label: "Sangat Segar", color: "text-emerald-700 bg-emerald-100 border-emerald-300" };
  if (score >= 70) return { score, label: "Segar", color: "text-emerald-500 bg-emerald-50 border-emerald-200" };
  if (score >= 50) return { score, label: "Cukup", color: "text-amber-600 bg-amber-50 border-amber-200" };
  return { score, label: "Kurang Segar", color: "text-red-600 bg-red-50 border-red-200" };
}
