import { LandingNav } from "@/components/landing/landing-nav"
import { HeroSection } from "@/components/landing/hero-section"
import { Footer } from "@/components/landing/footer"
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
