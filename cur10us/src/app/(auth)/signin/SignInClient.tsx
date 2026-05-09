"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { signIn as nextAuthSignIn, getSession } from "next-auth/react";
import { signInSchema } from "@/lib/validations/auth";
import { getDashboardPath } from "@/lib/routes";

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reason = searchParams.get("reason");

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const session = await getSession();

      if (session) {
        const getCookieValue = (name: string) => {
          const match = document.cookie.match(
            new RegExp("(^| )" + name + "=([^;]+)"),
          );
          return match ? decodeURIComponent(match[2]) : null;
        };

        const callbackUrl = getCookieValue("next-auth-callback-url");

        if (callbackUrl && callbackUrl.startsWith("/")) {
          document.cookie = "next-auth-callback-url=; max-age=0; path=/";
          router.push(callbackUrl);
          return;
        }

        const urlCallbackUrl = searchParams.get("callbackUrl");

        if (urlCallbackUrl && urlCallbackUrl.startsWith("/")) {
          router.push(urlCallbackUrl);
        } else {
          router.push("/minha-area");
        }
      }
    };

    checkSessionAndRedirect();
  }, [router, searchParams]);

  function validateForm() {
    const newErrors: { email?: string; password?: string } = {};
    const parsed = signInSchema.safeParse({ email, password });

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === "email") newErrors.email = issue.message;
        if (field === "password") newErrors.password = issue.message;
      });
    }

    setErrors(newErrors);
    return parsed.success;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrors({ general: "E-mail ou senha incorretos" });
        return;
      }

      const session = await getSession();

      if (!session?.user?.emailVerified) {
        router.push("/verify-email");
        return;
      }

      const dashboard = getDashboardPath(session?.user?.id);
      const isSuperAdmin = session?.user?.role === "super_admin";

      const callbackUrl = searchParams.get("callbackUrl");

      if (callbackUrl && callbackUrl.startsWith("/")) {
        router.push(callbackUrl);
      } else if (isSuperAdmin) {
        router.push("/admin");
      } else if (session?.user?.isActive && session?.user?.schoolId) {
        router.push(dashboard);
      } else {
        router.push("/minha-area");
      }

      router.refresh();
    } catch {
      setErrors({ general: "Erro de conexão. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">
                Bem-vindo de volta
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Entre na sua conta para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {reason === "session_expired" && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-600 dark:text-amber-400">
                  A sua sessão foi terminada porque iniciou sessão noutro
                  dispositivo.
                </div>
              )}

              {errors.general && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                  {errors.general}
                </div>
              )}

              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-sm font-medium">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full h-10 px-3 rounded-xl border"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Senha</label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full h-10 px-3 pr-10 rounded-xl border"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* SUBMIT */}
              <button
                disabled={loading}
                className="w-full h-10 rounded-xl bg-black text-white flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400">
                  ou
                </span>
              </div>
            </div>

            {/* Google login */}
            <button
              type="button"
              onClick={() => {
                const callbackUrl = searchParams.get("callbackUrl");
                nextAuthSignIn("google", {
                  callbackUrl: callbackUrl || "/minha-area",
                });
              }}
              disabled={loading}
              className="w-full h-10 flex items-center justify-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar com Google
            </button>

            <div className="mt-6 text-center text-sm">
              Não tem conta?{" "}
              <Link href="/signup" className="text-indigo-500">
                Criar conta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
