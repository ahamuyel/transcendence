"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Clock, AlertTriangle, CheckCircle,
  School, ArrowRight, UserPlus,
  ClipboardList, Sparkles, Send, ShieldCheck,
  User, Mail, Calendar, ExternalLink,
  BookOpen, BarChart3, Users, MessageSquare, Settings,
  Loader2, X, ChevronDown,
} from "lucide-react"
import StatusBadge from "@/components/ui/StatusBadge"
import ConfirmActionModal from "@/components/ui/ConfirmActionModal"

/* ─── Labels e ícones ─── */

const roleLabels: Record<string, string> = {
  school_admin: "Administrador",
  teacher: "Professor",
  student: "Aluno",
  parent: "Encarregado",
}

const roleIcons: Record<string, React.ElementType> = {
  school_admin: ShieldCheck,
  teacher: BookOpen,
  student: User,
  parent: Users,
}

const roleColors: Record<string, string> = {
  school_admin: "text-violet-600 dark:text-violet-400",
  teacher: "text-blue-600 dark:text-blue-400",
  student: "text-emerald-600 dark:text-emerald-400",
  parent: "text-amber-600 dark:text-amber-400",
}

const ROLES_DISPONIVEIS = [
  { id: "student", label: "Aluno", desc: "Solicitar matrícula como aluno" },
  { id: "teacher", label: "Professor", desc: "Solicitar contratação como docente" },
  { id: "parent", label: "Encarregado", desc: "Solicitar como encarregado de educação" },
]

const CLASSES = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}ª classe` }))

/* ─── Tipos ─── */

type Application = {
  id: string
  status: string
  role: string
  rejectReason: string | null
  createdAt: string
  school: { id: string; name: string; city: string }
}

type PublicSchool = {
  id: string
  name: string
  slug: string
  city?: string
}

type UserSchool = {
  id: string
  name: string
  slug: string
  city: string | null
  logo: string | null
  roles: string[]
  status: string
}

/* ─── Página Principal ─── */

export default function MinhaAreaPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [schools, setSchools] = useState<PublicSchool[]>([])
  const [userSchools, setUserSchools] = useState<UserSchool[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)

  // Modal de solicitação
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState<"school" | "role" | "form" | "success">("school")
  const [selSchool, setSelSchool] = useState("")
  const [selRole, setSelRole] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Form fields
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState("")
  const [docType, setDocType] = useState("")
  const [docNumber, setDocNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [desiredGrade, setDesiredGrade] = useState("")
  const [teachingArea, setTeachingArea] = useState("")
  const [relationship, setRelationship] = useState("")

  // Carregar dados
  const loadData = useCallback(async () => {
    if (sessionStatus !== "authenticated") return
    try {
      const [apps, schs, userSchs] = await Promise.all([
        fetch("/api/applications/mine").then((r) => r.json()),
        fetch("/api/schools/public").then((r) => r.json()),
        fetch("/api/user/schools").then((r) => r.json()),
      ])
      setApplications(Array.isArray(apps) ? apps : [])
      setSchools(Array.isArray(schs) ? schs : [])
      setUserSchools(Array.isArray(userSchs) ? userSchs : [])
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [sessionStatus])

  useEffect(() => { loadData() }, [loadData])

  if (sessionStatus === "loading" || loading) {
    return <SkeletonLoader />
  }

  const user = session?.user
  const hasActiveSchools = userSchools.length > 0
  const appliedSchoolIds = new Set(applications.map((a) => a.school.id))
  const blockedSchoolIds = new Set([...appliedSchoolIds, ...userSchools.map((s) => s.id)])
  const escolasDisponiveis = schools.filter((s) => !blockedSchoolIds.has(s.id))
  const pendingCount = applications.filter((a) => a.status === "pendente" || a.status === "em_analise").length

  const openModal = () => {
    setModalStep("school")
    setSelSchool("")
    setSelRole("")
    setPhone("")
    setGender("")
    setDocType("")
    setDocNumber("")
    setDateOfBirth("")
    setDesiredGrade("")
    setTeachingArea("")
    setRelationship("")
    setSubmitError("")
    setShowModal(true)
  }

  const handleNextStep = () => {
    if (modalStep === "school" && selSchool) setModalStep("role")
    else if (modalStep === "role" && selRole) setModalStep("form")
  }

  const handleSubmit = async () => {
    setSubmitError("")
    if (selRole === "student" && !desiredGrade) { setSubmitError("Seleccione a classe pretendida"); return }
    if (selRole === "student" && !gender) { setSubmitError("Seleccione o género"); return }
    if (selRole === "teacher" && !teachingArea.trim()) { setSubmitError("Indique a área de ensino"); return }
    if (selRole === "parent" && !relationship.trim()) { setSubmitError("Indique o parentesco"); return }
    if (!phone.trim()) { setSubmitError("Telefone é obrigatório"); return }

    setSubmitting(true)
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name || "",
          email: user?.email || "",
          phone,
          role: selRole,
          schoolId: selSchool,
          message: `Solicitação via Minha Área — ${roleLabels[selRole] || selRole}`,
          ...(selRole === "student" ? {
            gender,
            documentType: docType || undefined,
            documentNumber: docNumber || undefined,
            dateOfBirth: dateOfBirth || undefined,
            desiredGrade: desiredGrade ? parseInt(desiredGrade) : undefined,
          } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error || "Erro ao enviar"); return }

      setModalStep("success")
      const [apps, userSchs] = await Promise.all([
        fetch("/api/applications/mine").then((r) => r.json()),
        fetch("/api/user/schools").then((r) => r.json()),
      ])
      setApplications(Array.isArray(apps) ? apps : [])
      setUserSchools(Array.isArray(userSchs) ? userSchs : [])
    } catch {
      setSubmitError("Erro de conexão. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const closeModal = () => { setShowModal(false); setModalStep("school"); }

  const handleCancel = async () => {
    if (!cancelTarget) return
    try {
      const res = await fetch(`/api/applications/${cancelTarget}/cancel`, { method: "POST" })
      if (res.ok) setApplications((prev) => prev.filter((a) => a.id !== cancelTarget))
    } finally {
      setCancelTarget(null)
    }
  }

  const firstName = user?.name?.split(" ")[0] || "Utilizador"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"
  const quickActions = getQuickActions(userSchools)

  return (
    <div className="space-y-8">
      {/* 1. HERO */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 dark:from-indigo-800 dark:via-violet-800 dark:to-purple-900 p-6 sm:p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="relative">
            {user?.image ? (
              <img src={user.image} alt={user.name || ""} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/20 object-cover" />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white/80" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/70 font-medium">{greeting}!</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">{firstName}</h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1 truncate">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {userSchools.length > 0
                ? [...new Set(userSchools.flatMap((s) => s.roles))].slice(0, 3).map((role) => {
                    const Icon = roleIcons[role] || User
                    return (
                      <span key={role} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-sm">
                        <Icon size={12} /> {roleLabels[role] || role}
                      </span>
                    )
                  })
                : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-sm">
                    <AlertTriangle size={12} /> Sem escola vinculada
                  </span>
                )
              }
            </div>
            {hasActiveSchools && (
              <Link href="/dashboard" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition backdrop-blur-sm">
                Ir para o painel <ExternalLink size={14} />
              </Link>
            )}
          </div>
          <div className="flex gap-3 sm:flex-col sm:gap-2 sm:items-end">
            <StatCard label="Escolas" value={userSchools.length} />
            <StatCard label="Roles" value={new Set(userSchools.flatMap((s) => s.roles)).size} />
            {pendingCount > 0 && <StatCard label="Pendentes" value={pendingCount} />}
          </div>
        </div>
      </section>

      {/* 2. ESCOLAS ACTIVAS */}
      {hasActiveSchools && (
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
            <School size={18} className="text-indigo-500" /> As minhas escolas
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userSchools.map((school) => <SchoolCard key={school.id} school={school} />)}
          </div>
        </section>
      )}

      {/* 3. SOLICITAR — botão principal */}
      {!hasActiveSchools && (
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
            <UserPlus size={18} className="text-indigo-500" /> Solicitar vinculação
          </h2>
          {escolasDisponiveis.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Não há escolas disponíveis para solicitar neste momento.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                Escolha uma escola e o role pretendido para solicitar vinculação
              </p>
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-lg shadow-indigo-600/20"
              >
                <UserPlus size={16} /> Nova solicitação
              </button>
            </div>
          )}
        </section>
      )}

      {/* 4. HISTÓRICO */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ClipboardList size={18} className="text-indigo-500" /> Histórico de solicitações
          </h2>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {applications.length} {applications.length === 1 ? "solicitação" : "solicitações"}
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center">
            <ClipboardList size={32} className="mx-auto text-zinc-400 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Ainda não tem nenhuma solicitação.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{app.school.name}</span>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {roleLabels[app.role] || app.role}
                      {app.school.city && ` · ${app.school.city}`}
                      {` · ${new Date(app.createdAt).toLocaleDateString("pt")}`}
                    </p>
                    {app.rejectReason && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-950/30 rounded-lg px-2.5 py-1.5 inline-block">
                        Motivo: {app.rejectReason}
                      </p>
                    )}
                  </div>
                  {(app.status === "pendente" || app.status === "em_analise") && (
                    <button onClick={() => setCancelTarget(app.id)} className="text-xs text-red-600 dark:text-red-400 hover:underline shrink-0 font-medium">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. RECURSOS RÁPIDOS */}
      {quickActions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-indigo-500" /> Acções rápidas
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href} className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex items-center gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950 transition-colors">
                  <action.icon size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{action.label}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. COMO FUNCIONA */}
      {!hasActiveSchools && (
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-indigo-500" /> Como funciona
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: UserPlus, label: "Criar conta", desc: "Registe-se na plataforma" },
              { icon: Send, label: "Escolher escola", desc: "Seleccione escola e role" },
              { icon: Clock, label: "Aguardar aprovação", desc: "A escola analisa o pedido" },
              { icon: ShieldCheck, label: "Aceder", desc: "Acesso ao painel da escola" },
            ].map((step, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mx-auto mb-3">
                  <step.icon size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{step.label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. A MINHA CONTA */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
          <Settings size={18} className="text-indigo-500" /> A minha conta
        </h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex items-center gap-4">
                {user?.image ? (
                  <img src={user.image} alt={user.name || ""} className="w-14 h-14 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-700" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-zinc-200 dark:border-zinc-700">
                    <User size={24} className="text-zinc-400 dark:text-zinc-500" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{user?.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex-1 grid gap-3 sm:grid-cols-2">
                <InfoItem icon={Mail} label="Provider" value="Email" />
                <InfoItem icon={Calendar} label="Registado em" value={session?.expires ? new Date(session.expires).toLocaleDateString("pt") : "—"} />
              </div>
            </div>
          </div>
          <div className="px-4 sm:px-6 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Gerir as suas definições de conta</p>
            <Link href="/change-password" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              Alterar palavra-passe <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Cancel modal */}
      <ConfirmActionModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancelar solicitação"
        message="Tem a certeza que deseja cancelar esta solicitação? Esta acção não pode ser desfeita."
        confirmLabel="Cancelar solicitação"
        confirmColor="red"
      />

      {/* ═══════════════════════════════════════════
          MODAL DE SOLICITAÇÃO
         ═══════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4" onClick={(e) => e.target === e.currentTarget && !submitting && closeModal()}>
          <div className="w-full sm:max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {modalStep === "school" && "Escolha a escola"}
                {modalStep === "role" && "Escolha o role"}
                {modalStep === "form" && `Dados — ${roleLabels[selRole] || selRole}`}
                {modalStep === "success" && "Solicitação enviada"}
              </h2>
              <button onClick={closeModal} disabled={submitting} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                <X size={18} className="text-zinc-400" />
              </button>
            </div>

            <div className="p-5">
              {/* Step 1: Escola */}
              {modalStep === "school" && (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Seleccione a escola onde deseja solicitar vinculação</p>
                  <div className="relative">
                    <select
                      value={selSchool}
                      onChange={(e) => setSelSchool(e.target.value)}
                      className="w-full h-10 px-3 pr-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
                    >
                      <option value="">Seleccione uma escola...</option>
                      {escolasDisponiveis.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}{s.city ? ` — ${s.city}` : ""}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={handleNextStep}
                    disabled={!selSchool}
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continuar <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Step 2: Role */}
              {modalStep === "role" && (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Seleccione o role que pretende nesta escola</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES_DISPONIVEIS.map(({ id, label }) => {
                      const Icon = roleIcons[id] || User
                      return (
                        <button
                          key={id}
                          onClick={() => setSelRole(id)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            selRole === id
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-700"
                              : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:border-indigo-300 dark:hover:border-indigo-600"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center ${selRole === id ? "bg-indigo-100 dark:bg-indigo-950" : "bg-zinc-100 dark:bg-zinc-700"}`}>
                            <Icon size={14} className={selRole === id ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"} />
                          </div>
                          <p className={`text-xs font-medium ${selRole === id ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-600 dark:text-zinc-400"}`}>{label}</p>
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setModalStep("school")} className="flex-1 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                      Voltar
                    </button>
                    <button
                      onClick={handleNextStep}
                      disabled={!selRole}
                      className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continuar <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Form por role */}
              {modalStep === "form" && (
                <div className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                      {submitError}
                    </div>
                  )}

                  {/* Campos comuns */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Telefone *</label>
                    <input
                      type="tel"
                      placeholder="+244 900 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
                    />
                  </div>

                  {/* Campos específicos — Aluno */}
                  {selRole === "student" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Género *</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition appearance-none">
                          <option value="">Seleccione...</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Tipo de documento</label>
                          <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition appearance-none">
                            <option value="">Seleccione...</option>
                            <option value="BI">BI</option>
                            <option value="Passaporte">Passaporte</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Nº do documento</label>
                          <input type="text" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Data de nascimento</label>
                        <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Classe pretendida *</label>
                        <select value={desiredGrade} onChange={(e) => setDesiredGrade(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition appearance-none">
                          <option value="">Seleccione a classe...</option>
                          {CLASSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Campos específicos — Professor */}
                  {selRole === "teacher" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Área de ensino *</label>
                        <input
                          type="text"
                          placeholder="Ex: Matemática, Física, Português"
                          value={teachingArea}
                          onChange={(e) => setTeachingArea(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
                        />
                      </div>
                    </>
                  )}

                  {/* Campos específicos — Encarregado */}
                  {selRole === "parent" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Parentesco *</label>
                        <select value={relationship} onChange={(e) => setRelationship(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition appearance-none">
                          <option value="">Seleccione...</option>
                          <option value="pai">Pai</option>
                          <option value="mae">Mãe</option>
                          <option value="tutor">Tutor / Outro</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setModalStep("role")} className="flex-1 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                      Voltar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                    >
                      {submitting ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : <><Send size={16} /> Enviar solicitação</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {modalStep === "success" && (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Solicitação enviada!</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    A sua solicitação foi enviada à escola. Aguarda aprovação.
                  </p>
                  <button onClick={closeModal} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition">
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Sub-componentes
   ═══════════════════════════════════════════════════════════ */

function SkeletonLoader() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="rounded-2xl bg-zinc-200 dark:bg-zinc-800 h-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 h-32" />)}
      </div>
      <div className="space-y-3">
        {[1, 2].map((i) => <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 h-20" />)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 h-16" />)}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  )
}

function SchoolCard({ school }: { school: UserSchool }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start gap-3">
          {school.logo ? (
            <img src={school.logo} alt={school.name} className="w-10 h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
              <School size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{school.name}</p>
            {school.city && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{school.city}</p>}
          </div>
          <StatusBadge status={school.status} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {[...new Set(school.roles)].map((role) => {
            const Icon = roleIcons[role] || User
            return (
              <span key={role} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${roleColors[role] || "text-zinc-600"} bg-zinc-100 dark:bg-zinc-800`}>
                <Icon size={10} /> {roleLabels[role] || role}
              </span>
            )
          })}
        </div>
        <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-lg shadow-indigo-600/20">
          Aceder ao painel <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
      <Icon size={16} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{value}</p>
      </div>
    </div>
  )
}

function getQuickActions(userSchools: UserSchool[]) {
  const actions: Array<{ icon: React.ElementType; label: string; desc: string; href: string }> = []
  const allRoles = new Set(userSchools.flatMap((s) => s.roles))
  const dashboardHref = "/dashboard"

  if (allRoles.has("student")) {
    actions.push({ icon: BarChart3, label: "Ver notas", desc: "Consultar resultados", href: dashboardHref })
    actions.push({ icon: Calendar, label: "Ver horário", desc: "Horário de aulas", href: dashboardHref })
    actions.push({ icon: ClipboardList, label: "Ver tarefas", desc: "Trabalhos pendentes", href: dashboardHref })
  }
  if (allRoles.has("teacher")) {
    actions.push({ icon: Users, label: "Ver turmas", desc: "Turmas atribuídas", href: dashboardHref })
    actions.push({ icon: BarChart3, label: "Lançar notas", desc: "Registar avaliações", href: dashboardHref })
    actions.push({ icon: Calendar, label: "Ver horário", desc: "Horário de aulas", href: dashboardHref })
  }
  if (allRoles.has("parent")) {
    actions.push({ icon: Users, label: "Ver filhos", desc: "Educandos", href: dashboardHref })
    actions.push({ icon: BarChart3, label: "Ver notas", desc: "Resultados dos filhos", href: dashboardHref })
    actions.push({ icon: MessageSquare, label: "Comunicados", desc: "Mensagens da escola", href: dashboardHref })
  }
  if (allRoles.has("school_admin")) {
    actions.push({ icon: Settings, label: "Painel de gestão", desc: "Administração da escola", href: dashboardHref })
  }

  return actions.slice(0, 4)
}
