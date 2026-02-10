import HeroSection from '@/components/landing/HeroSection';
import StatsBar from '@/components/landing/StatsBar';
import HowItWorks from '@/components/landing/HowItWorks';

export default function Home() {
  return (
    <div className="bg-white">
      <HeroSection />
      <StatsBar />
      <HowItWorks />
    </div>
  );
}
