"use client"

import dynamic from "next/dynamic"
import HomeHero from "@/components/home/HomeHero"

const AnimatedBackground = dynamic(
  () => import("@/components/home/AnimatedBackground"),
  { ssr: false }
)

interface HomeClientProps {
  locale: string
  translations: {
    placeholder?: string
    button?: string
    suggestions?: {
      label?: string
      items?: string[]
    }
  }
}

export default function HomeClient({ locale, translations }: HomeClientProps) {
  return (
    <>
      <AnimatedBackground />
      <HomeHero locale={locale} translations={translations} />
    </>
  )
}