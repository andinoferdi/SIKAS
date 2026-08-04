import Link from "next/link"
import { Reveal } from "@/components/scroll"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24 lg:py-32">
        <Reveal className="flex max-w-2xl flex-col items-start gap-6">
          <h2 className="font-serif text-h2 text-foreground">
            Siap untuk mulai mencatat dan merencanakan keuanganmu?
          </h2>
          <Link href="/register">
            <Button
              size="lg"
              className="h-12 gap-2 rounded-full px-8 text-base font-semibold"
            >
              Daftar Gratis Sekarang
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
