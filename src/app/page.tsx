import { Navbar } from "@/components/landing/Navbar";
import { HeroBento } from "@/components/landing/HeroBento";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { ProductBento } from "@/components/landing/ProductBento";
import { HowItWorksBento } from "@/components/landing/HowItWorksBento";
import { RoleBento } from "@/components/landing/RoleBento";
import { TestimonialBento } from "@/components/landing/TestimonialBento";
import { CTABanner } from "@/components/landing/CTABanner";
import { FooterBento } from "@/components/landing/FooterBento";

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
                <HeroBento images={landingImages} />
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
