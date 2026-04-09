import { ProdukView } from "@/components/dashboard/buyer/ProdukView";

export default async function ProdukPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; method?: string }>;
}) {
  const params = await searchParams;
  return <ProdukView q={params.q} method={params.method} />;
}

