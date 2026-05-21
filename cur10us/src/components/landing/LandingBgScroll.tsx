"use client"

import { useEffect } from "react"

const MAX_OPACITY = 0.15

export default function LandingBgScroll() {
  useEffect(() => {
    const bg = document.querySelector<HTMLElement>(".landing-bg")
    if (!bg) return

    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const vh = window.innerHeight
          const scrollY = window.scrollY
          const opacity = Math.max(0, MAX_OPACITY - scrollY / (vh * 0.8))
          bg.style.opacity = String(opacity)
          ticking = false
        })
        ticking = true
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return null
}
