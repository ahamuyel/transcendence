import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { comparePassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const PERMISSION_KEYS = [
  "canManageApplications",
  "canManageTeachers",
  "canManageStudents",
  "canManageParents",
  "canManageClasses",
  "canManageCourses",
  "canManageSubjects",
  "canManageLessons",
  "canManageExams",
  "canManageAssignments",
  "canManageResults",
  "canManageAttendance",
  "canManageMessages",
  "canManageAnnouncements",
  "canManageAdmins",
] as const;

function extractPermissions(perm: Record<string, unknown> | null): string[] {
  if (!perm) return [];
  return PERMISSION_KEYS.filter((key) => perm[key] === true);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", updateAge: 60, maxAge: 24 * 60 * 60 },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  cookies: {
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "next-auth-callback-url",
      options: {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    ...(process.env.GOOGLE_AUTH_ENABLED === "true"
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          const email = credentials.email as string;
          const password = credentials.password as string;

          if (!email || !password) return null;

          const user = await prisma.user.findUnique({
            where: { email },
          include: { school: { select: { slug: true, status: true } } },
          });
          if (!user) return null;

          if (!user.hashedPassword) return null;

          const isValid = await comparePassword(password, user.hashedPassword);
          if (!isValid) return null;

          if (!user.isActive) return null;
          if (!user.emailVerified) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            schoolId: user.schoolId,
            schoolSlug: user.school?.slug ?? null,
            schoolStatus: user.school?.status ?? null,
            isActive: user.isActive,
            mustChangePassword: user.mustChangePassword,
            profileComplete: user.profileComplete,
            emailVerified: user.emailVerified ? new Date() : null,
            hasPassword: !!user.hashedPassword,
            sessionVersion: user.sessionVersion,
            twoFactorEnabled: user.twoFactorEnabled,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email!;

        const existing = await prisma.user.findUnique({
          where: { email },
          include: { school: { select: { slug: true } } },
        });

        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              provider:
                existing.provider === "google"
                  ? "google"
                  : existing.hashedPassword
                    ? "both"
                    : "google",
              providerId: account.providerAccountId,
              image: user.image ?? existing.image,
              emailVerified: true,
            },
          });
          // ✅ Passa o ID real da DB para o token
          user.id = existing.id;
          return true;
        }

        // Novo utilizador Google
        const created = await prisma.user.create({
          data: {
            name: user.name ?? email.split("@")[0],
            email,
            provider: "google",
            providerId: account.providerAccountId,
            image: user.image,
            isActive: true,
            profileComplete: false,
            emailVerified: true,
            role: "student",
          },
        });
        // ✅ Passa o ID real da DB para o token
        user.id = created.id;
        return true;
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      delete token.picture;

      // Primeiro login — dados vêm do objecto user
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: string }).role;
        token.schoolId =
          (user as { schoolId?: string | null }).schoolId ?? null;
        token.schoolSlug =
          (user as { schoolSlug?: string | null }).schoolSlug ?? null;
        token.schoolStatus =
          (user as { schoolStatus?: string | null }).schoolStatus ?? null;
        token.isActive = (user as { isActive: boolean }).isActive;
        token.mustChangePassword =
          (user as { mustChangePassword?: boolean }).mustChangePassword ??
          false;
        token.profileComplete =
          (user as { profileComplete: boolean }).profileComplete ?? true;
        token.emailVerified = (user as { emailVerified?: boolean })
          .emailVerified
          ? new Date()
          : null;
        const img = (user as { image?: string | null }).image;
        token.userImage = img && !img.startsWith("data:") ? img : null;
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 0;
        token.hasPassword = (user as { hasPassword?: boolean }).hasPassword ?? false;
        token.twoFactorEnabled = (user as { twoFactorEnabled?: boolean }).twoFactorEnabled ?? false;
        token.twoFactorVerifiedAt = null;
      }

      // Handle session.update() — merge twoFactorVerifiedAt into token
      // so the current session is marked as 2FA-verified after login verification
      if (trigger === "update" && session?.twoFactorVerifiedAt) {
        token.twoFactorVerifiedAt = session.twoFactorVerifiedAt;
      }

      // Refresh from DB on every request to keep token in sync with latest user data
      // (approvals, role changes, school associations, etc.)
      // NOTE: twoFactorVerifiedAt is intentionally NOT read from DB here.
      // It is managed via session.update() after 2FA verification to ensure
      // 2FA is always required on every new login session.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            role: true,
            schoolId: true,
            isActive: true,
            image: true,
            mustChangePassword: true,
            profileComplete: true,
            emailVerified: true,
            sessionVersion: true,
            hashedPassword: true,
            twoFactorEnabled: true,
            twoFactorVerifiedAt: true,
            school: { select: { slug: true, features: true, status: true } },
            adminPermission: {
              select: {
                level: true,
                ...Object.fromEntries(PERMISSION_KEYS.map((k) => [k, true])),
              },
            },
          },
        });

        if (dbUser) {
          // Session invalidation — if sessionVersion changed (password reset, etc.), discard token
          if (dbUser.sessionVersion !== (token.sessionVersion as number)) {
            return null as unknown as typeof token
          }

          token.id = dbUser.id;
          token.role = dbUser.role;
          token.schoolId = dbUser.schoolId ?? null;
          token.schoolSlug = dbUser.school?.slug ?? null;
          token.schoolStatus = dbUser.school?.status ?? null;
          token.isActive = dbUser.isActive;
          token.mustChangePassword = dbUser.mustChangePassword;
          token.profileComplete = dbUser.profileComplete;
          token.emailVerified = dbUser.emailVerified ? new Date() : null;
          token.adminLevel = dbUser.adminPermission?.level ?? null;
          token.permissions = extractPermissions(
            dbUser.adminPermission as unknown as Record<string, unknown>,
          );
          token.schoolFeatures =
            (dbUser.school?.features as Record<string, boolean>) ?? null;
          const img = dbUser.image;
          token.userImage = img && !img.startsWith("data:") ? img : null;
          token.sessionVersion = dbUser.sessionVersion;
          token.hasPassword = !!dbUser.hashedPassword;
          token.twoFactorEnabled = dbUser.twoFactorEnabled;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!token?.id) return session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.schoolId = (token.schoolId as string) ?? null;
        session.user.schoolSlug = (token.schoolSlug as string) ?? null;
        session.user.schoolStatus = (token.schoolStatus as string) ?? null;
        session.user.isActive = token.isActive as boolean;
        session.user.mustChangePassword =
          (token.mustChangePassword as boolean) ?? false;
        session.user.profileComplete = token.profileComplete as boolean;
        session.user.emailVerified =
          (token.emailVerified as Date | null) ?? null;
        session.user.adminLevel = (token.adminLevel as string) ?? null;
        session.user.permissions = (token.permissions as string[]) ?? [];
        session.user.schoolFeatures =
          (token.schoolFeatures as Record<string, boolean>) ?? null;
        session.user.image = (token.userImage as string) ?? null;
        session.user.hasPassword = (token.hasPassword as boolean) ?? false;
        session.user.twoFactorEnabled = (token.twoFactorEnabled as boolean) ?? false;
        session.user.twoFactorVerifiedAt = (token.twoFactorVerifiedAt as string) ?? null;
      }
      return session;
    },
  },
});
