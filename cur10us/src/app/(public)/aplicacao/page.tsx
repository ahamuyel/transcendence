"use client"

import { useEffect, useState } from "react"
import { Loader2, Send, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface PublicSchool {
  id: string
  name: string
  slug: string
}

interface PublicCourse {
  id: string
  name: string
}

export default function ApplicationPage() {
  const [schools, setSchools] = useState<PublicSchool[]>([])
  const [courses, setCourses] = useState<PublicCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSchools, setLoadingSchools] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [schoolId, setSchoolId] = useState("")
  const [message, setMessage] = useState("")

  // Student-specific fields
  const [gender, setGender] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [documentNumber, setDocumentNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [desiredGrade, setDesiredGrade] = useState("")
  const [desiredCourseId, setDesiredCourseId] = useState("")

  useEffect(() => {
    fetch("/api/schools/public")
      .then((r) => r.json())
      .then(setSchools)
      .catch(() => setError("Erro ao carregar escolas"))
      .finally(() => setLoadingSchools(false))
  }, [])

  // Fetch courses when school changes and role is student
  useEffect(() => {
    if (schoolId && role === "student") {
      setLoadingCourses(true)
      setCourses([])
      setDesiredCourseId("")
      fetch(`/api/schools/${schoolId}/courses`)
        .then((r) => r.json())
        .then(setCourses)
        .catch(() => setCourses([]))
        .finally(() => setLoadingCourses(false))
    } else {
      setCourses([])
      setDesiredCourseId("")
    }
  }, [schoolId, role])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          role,
          schoolId,
          message,
          ...(role === "student"
            ? {
                gender: gender || undefined,
                documentType: documentType || undefined,
                documentNumber: documentNumber || undefined,
                dateOfBirth: dateOfBirth || undefined,
                desiredGrade: desiredGrade ? parseInt(desiredGrade) : undefined,
                desiredCourseId: desiredCourseId || undefined,
              }
            : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao enviar solicitação")
        return
      }

      setSuccess(data.trackingToken)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Solicitação enviada!</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
          Sua solicitação foi recebida. Você receberá um e-mail com os próximos passos.
        </p>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 mb-6">
          <p className="text-sm text-zinc-500 mb-1">Seu código de acompanhamento:</p>
          <p className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100 break-all">{success}</p>
        </div>
        <Link
          href={`/aplicacao/status?token=${success}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
        >
          Acompanhar status
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Solicitar matrícula</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Preencha os dados abaixo para enviar sua solicitação à escola
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="school" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Escola <span className="text-red-500">*</span>
          </label>
          {loadingSchools ? (
            <div className="flex items-center gap-2 text-sm text-zinc-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando escolas...
            </div>
          ) : (
            <select
              id="school"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
            >
              <option value="">Selecione a escola</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Nome completo <span className="text-red-500">*</span>
          </label>
          <input
            id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            E-mail <span className="text-red-500">*</span>
          </label>
          <input
            id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Telefone <span className="text-red-500">*</span>
          </label>
          <input
            id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Perfil <span className="text-red-500">*</span>
          </label>
          <select
            id="role" value={role} onChange={(e) => setRole(e.target.value)} required disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
          >
            <option value="">Selecione</option>
            <option value="teacher">Professor(a)</option>
            <option value="student">Aluno(a)</option>
            <option value="parent">Encarregado de educação</option>
          </select>
        </div>

        {role === "student" && (
          <>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                Género
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
              >
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="documentType" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                  Tipo de documento
                </label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
                >
                  <option value="">Selecione</option>
                  <option value="BI">BI</option>
                  <option value="Passaporte">Passaporte</option>
                </select>
              </div>
              <div>
                <label htmlFor="documentNumber" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                  N.o do documento
                </label>
                <input
                  id="documentNumber"
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                Data de nascimento
              </label>
              <input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label htmlFor="desiredGrade" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                Classe pretendida
              </label>
              <select
                id="desiredGrade"
                value={desiredGrade}
                onChange={(e) => setDesiredGrade(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
              >
                <option value="">Selecione a classe</option>
                {Array.from({ length: 13 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>{g}.a classe</option>
                ))}
              </select>
            </div>

            {schoolId && (
              <div>
                <label htmlFor="desiredCourseId" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                  Curso pretendido
                </label>
                {loadingCourses ? (
                  <div className="flex items-center gap-2 text-sm text-zinc-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Carregando cursos...
                  </div>
                ) : courses.length > 0 ? (
                  <select
                    id="desiredCourseId"
                    value={desiredCourseId}
                    onChange={(e) => setDesiredCourseId(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
                  >
                    <option value="">Selecione o curso</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-zinc-400 py-2">Nenhum curso disponível nesta escola</p>
                )}
              </div>
            )}
          </>
        )}

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Mensagem (opcional)
          </label>
          <textarea
            id="message" value={message} onChange={(e) => setMessage(e.target.value)} disabled={loading}
            placeholder="Informações adicionais..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Enviando..." : "Enviar solicitação"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
        Já tem um código?{" "}
        <Link href="/aplicacao/status" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          Acompanhar status
        </Link>
      </p>
    </div>
  )
}
