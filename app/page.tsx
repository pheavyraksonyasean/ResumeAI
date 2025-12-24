import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import FeaturesGrid from "@/components/features-grid";
import UserSegments from "@/components/user-segments";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <HeroSection />
      <FeaturesGrid />
      <UserSegments />
      <Footer />
    </main>
  );
}
