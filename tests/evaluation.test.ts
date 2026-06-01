import { describe, it, expect } from "vitest"

describe("Evaluation Engine Logic", () => {
  it("should calculate correct average", () => {
    const scores = [14, 16, 18]
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    expect(avg).toBe(16)
  })

  it("should pass with average >= 10", () => {
    const passingGrade = 10
    const scores = [10, 12, 14]
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    expect(avg >= passingGrade).toBe(true)
  })

  it("should fail with average < 10", () => {
    const passingGrade = 10
    const scores = [8, 7, 9]
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    expect(avg >= passingGrade).toBe(false)
  })

  it("should apply trimester weights correctly", () => {
    const weights = { primeiro: 0.3, segundo: 0.3, terceiro: 0.4 }
    const grades = { primeiro: 12, segundo: 14, terceiro: 16 }

    const weightedAvg =
      grades.primeiro * weights.primeiro +
      grades.segundo * weights.segundo +
      grades.terceiro * weights.terceiro

    expect(weightedAvg).toBe(14.2)
  })

  it("should round correctly", () => {
    const value = 14.567
    const rounded = Math.round(value * 10) / 10
    expect(rounded).toBe(14.6)
  })
})
