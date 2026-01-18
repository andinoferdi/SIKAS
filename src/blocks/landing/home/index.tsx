import {
  LandingNav,
  HeroSection,
  StatsSection,
  FeaturesSection,
  CtaSection,
  Footer,
} from "@/blocks/landing/home/components"
import { Chatbot } from "@/components/chatbot"

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <Footer />
      <Chatbot />
    </div>
  )
}
