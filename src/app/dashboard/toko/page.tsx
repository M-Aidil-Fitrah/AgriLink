import { TokoView } from "@/components/dashboard/buyer/TokoView";

export default async function TokoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return <TokoView q={params.q} />;
}
