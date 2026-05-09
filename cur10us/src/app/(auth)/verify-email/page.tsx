"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { csrfPost } from "@/lib/csrf-client";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const justRegistered = searchParams.get("justRegistered");
  const [status, setStatus] = useState<
    "verifying" | "success" | "error" | "resend"
  >("resend");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("resend");
      return;
    }

    setStatus("verifying");

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: "POST",
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Falha na verificação");
          setStatus("error");
          return;
        }

        setStatus("success");
      } catch {
        setError("Erro de conexão. Tente novamente.");
        setStatus("error");
      }
    }

    verify();
  }, [token]);

  async function handleResend() {
    setResending(true);
    try {
      const res = await csrfPost("/api/auth/verify-email", { email });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Falha ao reenviar e-mail");
        return;
      }

      setResent(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setResending(false);
    }
  }

  if (status === "verifying") {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <h1 className="text-xl font-semibold">A verificar e-mail...</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Aguarde um momento
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        <h1 className="text-xl font-semibold">E-mail verificado!</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          O seu e-mail foi verificado com sucesso. Já pode entrar na sua conta.
        </p>
        <Link
          href="/signin"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-lg shadow-indigo-600/20"
        >
          Entrar agora
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 text-center">
        <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        <h1 className="text-xl font-semibold">Falha na verificação</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          O link pode ter expirado. Solicite um novo e-mail de verificação.
        </p>
        <Link
          href="/signin"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-sm font-medium transition"
        >
          Voltar ao login
        </Link>
      </div>
    );
  }

  // Resend state — no token provided
  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-6 text-center">
      <Mail className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
      <div>
        <h1 className="text-xl font-semibold">
          {justRegistered
            ? "Conta criada com sucesso!"
            : "Verifique o seu e-mail"}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          {justRegistered
            ? "Enviamos um e-mail de verificação para a sua caixa de entrada. Verifique também o spam."
            : "Insira o seu e-mail para receber um link de verificação"}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 w-full max-w-sm">
          {error}
        </div>
      )}

      {resent && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-600 dark:text-emerald-400 w-full max-w-sm">
          E-mail de verificação enviado com sucesso!
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleResend();
        }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={resending}
          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={resending || !email}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar link de verificação"
          )}
        </button>
      </form>

      <Link
        href="/signin"
        className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        Voltar ao login
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <h1 className="text-xl font-semibold">A carregar...</h1>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
