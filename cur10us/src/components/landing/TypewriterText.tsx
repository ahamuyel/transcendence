"use client"

import { useState, useEffect } from "react"

type Props = {
  words: string[]
  typeSpeed?: number
  deleteSpeed?: number
  pauseDuration?: number
}

export default function TypewriterText({ words, typeSpeed = 80, deleteSpeed = 40, pauseDuration = 2000 }: Props) {
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (words.length === 0) return

    const currentWord = words[wordIndex]

    if (isPaused) {
      const timeout = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, pauseDuration)
      return () => clearTimeout(timeout)
    }

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentWord.length) {
          setCharIndex((prev) => prev + 1)
        } else {
          setIsPaused(true)
        }
      } else {
        if (charIndex > 0) {
          setCharIndex((prev) => prev - 1)
        } else {
          setIsDeleting(false)
          setWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }, isDeleting ? deleteSpeed : typeSpeed)

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, isPaused, wordIndex, words, typeSpeed, deleteSpeed, pauseDuration])

  if (words.length === 0) return null

  return (
    <span className="inline-flex items-baseline">
      <span>{words[wordIndex].substring(0, charIndex)}</span>
      <span className="inline-block w-[2px] h-[0.85em] bg-current ml-0.5 animate-pulse rounded-full" />
    </span>
  )
}
