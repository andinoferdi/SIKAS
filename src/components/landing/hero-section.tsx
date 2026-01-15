"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-linear-to-b from-background via-sky-50 to-sky-100">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top left circle */}
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-linear-to-br from-sky-200 to-transparent opacity-30 blur-3xl"></div>
        {/* Bottom right circle */}
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-linear-to-tl from-sky-200 to-transparent opacity-30 blur-3xl"></div>
        {/* Center accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-sky-200 opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4 py-16 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground text-balance">
          Manage Your Money,{" "}
          <span className="bg-linear-to-r from-sky-600 to-sky-500 bg-clip-text text-transparent">Effortlessly</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed text-balance">
          Track your expenses, manage categories, and understand your spending patterns with a beautiful, intuitive
          interface. Take control of your finances today.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/login">
            <Button
              size="lg"
              className="font-medium px-8 transition-all duration-300 hover:shadow-lg hover:shadow-btn-primary-bg/20"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
