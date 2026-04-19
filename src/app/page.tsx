import dynamic from 'next/dynamic';
import { Navbar } from "@/components/landing/Navbar";
import { HeroBento } from "@/components/landing/HeroBento";

// Lazy load components below the fold to improve performance (TBT & LCP)
const FeatureBento = dynamic(() => import("@/components/landing/FeatureBento").then(mod => mod.FeatureBento), { ssr: true });
const ProductBento = dynamic(() => import("@/components/landing/ProductBento").then(mod => mod.ProductBento), { ssr: true });
const HowItWorksBento = dynamic(() => import("@/components/landing/HowItWorksBento").then(mod => mod.HowItWorksBento), { ssr: true });
const RoleBento = dynamic(() => import("@/components/landing/RoleBento").then(mod => mod.RoleBento), { ssr: true });
const TestimonialBento = dynamic(() => import("@/components/landing/TestimonialBento").then(mod => mod.TestimonialBento), { ssr: true });
const CTABanner = dynamic(() => import("@/components/landing/CTABanner").then(mod => mod.CTABanner), { ssr: true });
const FooterBento = dynamic(() => import("@/components/landing/FooterBento").then(mod => mod.FooterBento), { ssr: true });

export default function Home() {
    // Image paths from public/landing
    const landingImages = {
        hero: "/landing/hero.png",
        tomatoes: "/landing/tomatoes.png",
        farmer: "/landing/farmer.png",
        buyer: "/landing/buyer.png",
        howItWorks: "/landing/how-it-works.png",
    };

    return (
        <main className="min-h-screen bg-[#f2f4f0] font-sans text-stone-950 overflow-x-hidden">
            <Navbar />
            
            <div className="flex flex-col">
                {/* HeroBento is immediately visible, so we load it directly */}
                <HeroBento images={landingImages} />
                
                {/* Sections below the fold are loaded dynamically */}
                <FeatureBento images={landingImages} />
                <ProductBento images={landingImages} />
                <HowItWorksBento images={landingImages} />
                <RoleBento images={landingImages} />
                <TestimonialBento />
                <CTABanner />
                <FooterBento />
            </div>
        </main>
    );
}
