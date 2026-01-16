import { LandingNav } from "@/blocks/landing/home/components/landing-nav"
import { HeroSection } from "@/blocks/landing/home/components/hero-section"
import { Footer } from "@/blocks/landing/home/components/footer"
import { Chatbot } from "@/components/chatbot"

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
      </main>
      <Footer />
      <Chatbot />
    </div>
  )
}
