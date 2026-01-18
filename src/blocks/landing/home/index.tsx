import { LandingNav, HeroSection, Footer } from "@/blocks/landing/home/components"
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
