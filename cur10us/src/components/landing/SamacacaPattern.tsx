"use client"

import { useEffect, useRef } from "react"

export default function SamacacaPattern() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const statsSection = document.getElementById("stats-section")
    if (!container) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const vh = window.innerHeight
      const startFadeAt = statsSection ? statsSection.offsetTop - vh * 0.2 : vh * 0.8
      
      let opacity = 1
      if (scrollY > startFadeAt) {
        const fadeProgress = (scrollY - startFadeAt) / (vh * 4.0)
        opacity = Math.max(0, 1 - fadeProgress)
      }
      
      container.style.opacity = String(opacity)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[-2] pointer-events-none transition-opacity duration-300"
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Pattern Tile: 200x200 to accommodate all diverse elements */}
          <pattern id="samacaca-rich" width="200" height="200" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="0.4" className="text-black/10 dark:text-white/20">
              
              {/* 1. Zigzag Waves (Horizontal) */}
              <path d="M 0 20 L 25 5 L 50 20 L 75 5 L 100 20 L 125 5 L 150 20 L 175 5 L 200 20" />
              <path d="M 0 25 L 25 10 L 50 25 L 75 10 L 100 25 L 125 10 L 150 25 L 175 10 L 200 25" />
              <path d="M 0 30 L 25 15 L 50 30 L 75 15 L 100 30 L 125 15 L 150 30 L 175 15 L 200 30" />

              {/* 2. Concentric Diamonds (Losangos) */}
              {/* Diamond 1 */}
              <path d="M 40 80 L 60 60 L 80 80 L 60 100 Z" />
              <path d="M 45 80 L 60 65 L 75 80 L 60 95 Z" strokeWidth="0.3" />
              
              {/* Diamond 2 - Simple */}
              <path d="M 120 80 L 140 60 L 160 80 L 140 100 Z" />

              {/* 3. Concentric Circles (Círculos Concêntricos) */}
              <circle cx="100" cy="140" r="18" />
              <circle cx="100" cy="140" r="12" strokeWidth="0.3" />
              <circle cx="100" cy="140" r="6" strokeWidth="0.2" />

              {/* 4. Wavy Vertical Lines (Símbolos menores) */}
              <path d="M 20 120 Q 25 130 20 140 T 20 160" />
              <path d="M 25 120 Q 30 130 25 140 T 25 160" />
              <path d="M 30 120 Q 35 130 30 140 T 30 160" />

              <path d="M 170 120 Q 175 130 170 140 T 170 160" />
              <path d="M 175 120 Q 180 130 175 140 T 175 160" />
              <path d="M 180 120 Q 185 130 180 140 T 180 160" />

              {/* 5. Symbols: Rings, Points, Small Diamonds */}
              {/* Rings (Círculos Vazados) */}
              <circle cx="60" cy="180" r="4" />
              <circle cx="140" cy="180" r="4" />
              
              {/* Points (Círculos Preenchidos) */}
              <circle cx="100" cy="180" r="2" fill="currentColor" stroke="none" className="text-black/5 dark:text-white/10" />
              <circle cx="20" cy="180" r="2" fill="currentColor" stroke="none" className="text-black/5 dark:text-white/10" />
              <circle cx="180" cy="180" r="2" fill="currentColor" stroke="none" className="text-black/5 dark:text-white/10" />

              {/* Small Diamonds */}
              <path d="M 100 50 L 105 45 L 110 50 L 105 55 Z" fill="currentColor" stroke="none" className="text-black/5 dark:text-white/10" />
              <path d="M 30 50 L 35 45 L 40 50 L 35 55 Z" fill="currentColor" stroke="none" className="text-black/5 dark:text-white/10" />
              <path d="M 160 50 L 165 45 L 170 50 L 165 55 Z" fill="currentColor" stroke="none" className="text-black/5 dark:text-white/10" />

            </g>
          </pattern>
          
          <mask id="fade-mask">
            <rect width="100%" height="100%" fill="url(#fade-gradient)" />
            <linearGradient id="fade-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="40%" stopColor="white" stopOpacity="0.9" />
              <stop offset="80%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </mask>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#samacaca-rich)" mask="url(#fade-mask)" />
      </svg>
    </div>
  )
}
