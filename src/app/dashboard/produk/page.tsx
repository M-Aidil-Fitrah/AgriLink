import { ProdukView } from "@/components/dashboard/buyer/ProdukView";

export default function ProdukPage({
  searchParams,
}: {
  searchParams: { q?: string; method?: string };
}) {
  return <ProdukView q={searchParams.q} method={searchParams.method} />;
}
