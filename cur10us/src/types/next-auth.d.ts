import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      image?: string | null
      schoolId?: string | null
      schoolSlug?: string | null
      isActive: boolean
      mustChangePassword?: boolean
      profileComplete: boolean
      emailVerified: Date | boolean | null
      adminLevel?: string | null
      permissions?: string[]
      schoolFeatures?: Record<string, boolean> | null
    }
  }

  interface User {
    role: string
    schoolId?: string | null
    schoolSlug?: string | null
    isActive: boolean
    mustChangePassword?: boolean
    profileComplete: boolean
    emailVerified: Date | boolean | null
    adminLevel?: string | null
    permissions?: string[]
    schoolFeatures?: Record<string, boolean> | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    id: string
    schoolId?: string | null
    schoolSlug?: string | null
    isActive: boolean
    mustChangePassword?: boolean
    profileComplete: boolean
    emailVerified: Date | boolean | null
    adminLevel?: string | null
    permissions?: string[]
    schoolFeatures?: Record<string, boolean> | null
    userImage?: string | null
  }
}
