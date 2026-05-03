import { Suspense } from "react";
import PaymentView from "@/components/payment/PaymentView";

export const metadata = {
  title: "Payment | AgriLink",
};

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <PaymentView />
    </Suspense>
  );
}
