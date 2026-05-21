"use client"

import { useEffect } from "react"

export default function LandingBgScroll() {
  useEffect(() => {
    const bg = document.querySelector<HTMLElement>(".landing-bg")
    if (!bg) return

    const maxOpacity = parseFloat(getComputedStyle(bg).opacity) || 0.15
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const vh = window.innerHeight
          const scrollY = window.scrollY
          const opacity = Math.max(0, maxOpacity - scrollY / (vh * 0.8))
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
