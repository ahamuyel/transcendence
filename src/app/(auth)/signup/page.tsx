"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  GraduationCap,
  UserRound,
  UserPlus,
} from "lucide-react"
import { useState, useMemo } from "react"
import { signIn as nextAuthSignIn } from "next-auth/react"
import { signUpSchema } from "@/lib/validations/auth"
import { csrfPost } from "@/lib/csrf-client"
import {
  AuthCard,
  AuthHeader,
  AuthSuccess,
  FormInput,
  PasswordInput,
  SubmitButton,
  OAuthDivider,
  GoogleOAuthButton,
  TrustBadge,
  AlertBanner,
} from "@/components/auth"

const ACCOUNT_TYPES = [
  { icon: Building2, label: "Admin Escola", desc: "Registe a sua instituição" },
  { icon: UserRound, label: "Professor", desc: "Vincule-se a uma escola" },
  { icon: GraduationCap, label: "Estudante", desc: "Solicite matrícula" },
]

function PasswordRequirements({ password }: { password: string }) {
  const checks = useMemo(
    () => [
      { label: "Mínimo 8 caracteres", met: password.length >= 8 },
      { label: "Uma letra maiúscula", met: /[A-Z]/.test(password) },
      { label: "Uma letra minúscula", met: /[a-z]/.test(password) },
      { label: "Um número", met: /[0-9]/.test(password) },
    ],
    [password],
  )

  if (!password) return null

  return (
    <div className="mt-2 space-y-1">
      {checks.map((check) => (
        <div
          key={check.label}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            check.met
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          <svg
            className="w-3 h-3 shrink-0"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            {check.met ? (
              <path
                d="M3 6l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
            )}
          </svg>
          <span>{check.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    const parsed = signUpSchema.safeParse({ name, email, password })
    if (!parsed.success)
      parsed.error.issues.forEach((i) => {
        e[i.path[0] as string] = i.message
      })
    if (!acceptedTerms) e.terms = "Deve aceitar os Termos de Serviço e a Política de Privacidade"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await csrfPost("/api/auth/signup", { name, email, password })
      const data = await res.json()
      if (!res.ok) {
        setErrors({ general: data.error || "Erro ao criar conta" })
        return
      }
      setSuccess(true)
    } catch {
      setErrors({
        general: "Erro de conexão. Verifique a sua internet e tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthSuccess
        icon={GraduationCap}
        title="Conta criada com sucesso!"
        actionLabel="Ir para o login"
        actionHref="/signin"
        secondaryAction={
          <Link
            href="/verify-email"
            className="text-xs text-primary hover:underline font-medium"
          >
            Não recebeu o e-mail? Reenviar verificação
          </Link>
        }
      >
        <p>
          Enviámos um e-mail de verificação para{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {email}
          </span>
          .
        </p>
        <p>Clique no link para activar a sua conta antes de fazer login.</p>
      </AuthSuccess>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <AuthCard>
        <div className="p-6 sm:p-8">
          <AuthHeader
            icon={UserPlus}
            title="Criar conta"
            subtitle="Junte-se à plataforma de gestão escolar Cur10usX"
          />

          {/* Account type cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
            {ACCOUNT_TYPES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 p-3 text-center"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center mx-auto mb-1.5">
                  <Icon
                    size={15}
                    className="text-primary dark:text-primary-400"
                  />
                </div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {label}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errors.general && (
              <AlertBanner variant="error">{errors.general}</AlertBanner>
            )}

            <FormInput
              id="name"
              label="Nome completo"
              type="text"
              placeholder="O seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              disabled={loading}
              autoFocus
            />

            <FormInput
              id="signup-email"
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={loading}
            />

            <div>
              <PasswordInput
                id="signup-password"
                label="Palavra-passe"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                disabled={loading}
              />
              <PasswordRequirements password={password} />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary focus:ring-offset-0"
              />
              <label
                htmlFor="terms"
                className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed"
              >
                Li e aceito os{" "}
                <Link
                  href="/termos"
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                >
                  Termos de Serviço
                </Link>{" "}
                e a{" "}
                <Link
                  href="/privacidade"
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                >
                  Política de Privacidade
                </Link>
                .
              </label>
            </div>
            {errors.terms && (
              <p className="text-xs text-red-600 dark:text-red-400 -mt-2" role="alert">
                {errors.terms}
              </p>
            )}

            <SubmitButton loading={loading} loadingText="Criando conta...">
              Criar conta
            </SubmitButton>
          </form>

          <OAuthDivider label="ou registe-se com" />

          <GoogleOAuthButton disabled={loading} />

          <TrustBadge />
        </div>
      </AuthCard>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
        Já tem uma conta?{" "}
        <Link href="/signin" className="text-primary font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
