import { TokoDetailView } from "@/components/dashboard/buyer/TokoDetailView";

export default async function TokoDetailPage({
  params,
}: {
  params: Promise<{ sellerId: string }>;
}) {
  const { sellerId } = await params;
  return <TokoDetailView sellerId={sellerId} />;
}
