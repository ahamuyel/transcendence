import { describe, it, expect } from "vitest"
import { hashPassword, comparePassword } from "@/lib/password"

describe("Password Hashing", () => {
  it("should hash a password successfully", async () => {
    const hash = await hashPassword("test123")
    expect(hash).toBeDefined()
    expect(typeof hash).toBe("string")
    expect(hash.length).toBeGreaterThan(20)
  })

  it("should verify correct password", async () => {
    const hash = await hashPassword("myPassword123!")
    const result = await comparePassword("myPassword123!", hash)
    expect(result).toBe(true)
  })

  it("should reject incorrect password", async () => {
    const hash = await hashPassword("myPassword123!")
    const result = await comparePassword("wrongPassword", hash)
    expect(result).toBe(false)
  })

  it("should generate different hashes for same password", async () => {
    const hash1 = await hashPassword("samePassword")
    const hash2 = await hashPassword("samePassword")
    expect(hash1).not.toBe(hash2)
  })

  it("should handle empty password", async () => {
    const hash = await hashPassword("")
    expect(hash).toBeDefined()
  })
})
