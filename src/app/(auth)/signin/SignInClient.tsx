"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { signIn as nextAuthSignIn, getSession } from "next-auth/react"
import { signInSchema } from "@/lib/validations/auth"
import { getDashboardPath } from "@/lib/routes"
import { Mail, AlertCircle } from "lucide-react"
import {
  AuthCard,
  AuthHeader,
  FormInput,
  PasswordInput,
  SubmitButton,
  OAuthDivider,
  GoogleOAuthButton,
  TrustBadge,
  AlertBanner,
} from "@/components/auth"

function isValidRedirect(url: string): boolean {
  if (!url.startsWith("/")) return false
  if (url.startsWith("//")) return false
  if (url.includes("@")) return false
  if (url.includes("..")) return false
  return true
}

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: "Este e-mail já está associado a outro método de autenticação.",
  OAuthSignin: "Erro ao iniciar sessão com Google. Tente novamente.",
  OAuthCallback: "Erro ao processar o login com Google. Tente novamente.",
  default: "Ocorreu um erro ao autenticar. Tente novamente.",
}

export default function SignInClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const reason = searchParams.get("reason")
  const errorParam = searchParams.get("error")
  const callbackUrl = searchParams.get("callbackUrl")

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)
  const [schoolBranding, setSchoolBranding] = useState<{
    logo: string | null
    loginMessage: string | null
    primaryColor: string | null
  } | null>(null)

  useEffect(() => {
    fetch("/api/school-settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setSchoolBranding(data)
          if (data.primaryColor) {
            document.documentElement.style.setProperty("--school-primary", data.primaryColor)
          }
          if (data.secondaryColor) {
            document.documentElement.style.setProperty("--school-secondary", data.secondaryColor)
          }
          if (data.fontFamily) {
            document.documentElement.style.setProperty("--school-font-family", `'${data.fontFamily}', sans-serif`)
          }
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const session = await getSession()
      if (session) {
        const getCookieValue = (name: string) => {
          const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
          return match ? decodeURIComponent(match[2]) : null
        }
        const storedCallbackUrl = getCookieValue("next-auth-callback-url")
        if (storedCallbackUrl && isValidRedirect(storedCallbackUrl)) {
          document.cookie = "next-auth-callback-url=; max-age=0; path=/"
          router.push(storedCallbackUrl)
          return
        }
        if (callbackUrl && isValidRedirect(callbackUrl)) {
          router.push(callbackUrl)
        } else {
          router.push("/minha-area")
        }
      }
    }
    checkSessionAndRedirect()
  }, [router, searchParams, callbackUrl])

  function validateForm() {
    const newErrors: { email?: string; password?: string } = {}
    const parsed = signInSchema.safeParse({ email, password })
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (field === "email") newErrors.email = issue.message
        if (field === "password") newErrors.password = issue.message
      })
    }
    setErrors(newErrors)
    return parsed.success
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    if (!validateForm()) return

    setLoading(true)
    try {
      const res = await nextAuthSignIn("credentials", { email, password, redirect: false })
      if (res?.error) {
        setErrors({ general: "E-mail ou senha incorretos. Se acabou de se registar, verifique o seu e-mail." })
        return
      }
      const session = await getSession()

      if (session?.user?.twoFactorEnabled && !session?.user?.twoFactorVerifiedAt) {
        router.push(`/signin/verify-2fa?email=${encodeURIComponent(email)}`)
        return
      }

      const dashboard = getDashboardPath(session?.user?.id)
      const isSuperAdmin = session?.user?.role === "super_admin"

      if (callbackUrl && isValidRedirect(callbackUrl)) {
        router.push(callbackUrl)
      } else if (isSuperAdmin) {
        router.push("/admin")
      } else if (session?.user?.isActive && session?.user?.schoolId) {
        router.push(dashboard)
      } else {
        router.push("/minha-area")
      }
      router.refresh()
    } catch {
      setErrors({ general: "Erro de conexão. Verifique a sua internet e tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <AuthCard>
        <div className="p-6 sm:p-8">
          {/* School branding */}
          {schoolBranding?.logo && (
            <div className="flex justify-center mb-5">
              <Image
                src={schoolBranding.logo}
                alt="Logo da escola"
                width={56}
                height={56}
                className="w-14 h-14 object-contain rounded-lg"
              />
            </div>
          )}

          <AuthHeader
            title={schoolBranding?.loginMessage || "Bem-vindo de volta"}
            subtitle="Introduza os seus dados para aceder à plataforma"
          />

          {/* Alert banners */}
          {reason === "session_expired" && (
            <AlertBanner variant="warning" icon={AlertCircle} className="mb-5">
              A sua sessão foi terminada porque iniciou sessão noutro dispositivo.
            </AlertBanner>
          )}

          {reason === "password_changed" && (
            <AlertBanner variant="success" className="mb-5">
              Palavra-passe alterada com sucesso. Faça login novamente.
            </AlertBanner>
          )}

          {errorParam && (
            <AlertBanner variant="error" className="mb-5">
              {OAUTH_ERROR_MESSAGES[errorParam] || OAUTH_ERROR_MESSAGES.default}
            </AlertBanner>
          )}

          {errors.general && (
            <AlertBanner variant="error" className="mb-5">
              {errors.general}
            </AlertBanner>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormInput
              id="email"
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={loading}
            />

            <PasswordInput
              id="password"
              label="Senha"
              autoComplete="current-password"
              placeholder="A sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={loading}
              labelExtra={
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu-se?
                </Link>
              }
            />

            <SubmitButton loading={loading} loadingText="A entrar...">
              Entrar
            </SubmitButton>
          </form>

          <OAuthDivider />

          <GoogleOAuthButton disabled={loading} />

          <TrustBadge />
        </div>
      </AuthCard>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
        Ainda não tem conta?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
