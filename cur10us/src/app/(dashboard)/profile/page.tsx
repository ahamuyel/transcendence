"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Mail, Phone, MapPin, BookOpen, Users, GraduationCap, Loader2, Pencil, Check, X, Camera } from "lucide-react"

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  school_admin: "Administrador",
  teacher: "Professor",
  student: "Aluno",
  parent: "Encarregado",
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const ProfilePage = () => {
  const { data: session, update: updateSession } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState("")
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "", gender: "", dateOfBirth: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data)
        const entity = data.teacher || data.student || data.parent
        setEditForm({
          name: data.user?.name || "",
          phone: entity?.phone || "",
          address: entity?.address || "",
          gender: data.student?.gender || "",
          dateOfBirth: data.student?.dateOfBirth ? data.student.dateOfBirth.slice(0, 10) : "",
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name || undefined,
          phone: editForm.phone || undefined,
          address: editForm.address || undefined,
          gender: editForm.gender || null,
          dateOfBirth: editForm.dateOfBirth || null,
        }),
      })
      if (res.ok) {
        setEditing(false)
        // Re-fetch profile
        const data = await fetch("/api/profile").then((r) => r.json())
        setProfile(data)
        // Update session name
        if (editForm.name && editForm.name !== session?.user?.name) {
          await updateSession({ name: editForm.name })
        }
      }
    } catch { /* ignore */ }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError("")

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Formato inválido. Use JPEG, PNG ou WebP")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Ficheiro demasiado grande. Máximo 2MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/profile/photo", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) {
        setPhotoError(data.error || "Erro ao enviar foto")
        return
      }
      // Update local state
      setProfile((prev: any) => ({
        ...prev,
        user: { ...prev.user, image: data.url },
        ...(prev.teacher ? { teacher: { ...prev.teacher, foto: data.url } } : {}),
        ...(prev.student ? { student: { ...prev.student, foto: data.url } } : {}),
        ...(prev.parent ? { parent: { ...prev.parent, foto: data.url } } : {}),
      }))
      await updateSession()
    } catch {
      setPhotoError("Erro de conexão")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (!profile?.user) return null

  const { user } = profile
  const entity = profile.teacher || profile.student || profile.parent
  const phone = entity?.phone
  const address = entity?.address

  return (
    <div className="m-2 sm:m-3 flex flex-col gap-4">
      {/* Profile Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.image || "/avatar.png"}
              alt="Avatar"
              width={96}
              height={96}
              className="rounded-full object-cover border-4 border-zinc-200 dark:border-zinc-700 w-24 h-24"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
            >
              {uploading ? (
                <Loader2 size={20} className="text-white animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {photoError && (
              <p className="absolute -bottom-6 left-0 right-0 text-xs text-red-500 text-center whitespace-nowrap">{photoError}</p>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {user.name}
              </h1>
              {!editing && (
                <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-600 transition">
                  <Pencil size={14} />
                </button>
              )}
            </div>
            <span className="inline-block mt-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
              {roleLabels[user.role] || user.role}
            </span>
            {profile.school && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                {profile.school.name} — {profile.school.city}
              </p>
            )}
            {profile.student?.className && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Turma: {profile.student.className}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Editar Perfil</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nome</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {entity && (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Telefone</label>
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Endereço</label>
                  <input
                    value={editForm.address}
                    onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
            {user.role === "student" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Género</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 justify-end mt-4">
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
              <X size={14} /> Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Contacto</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</span>
            </div>
            {phone && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{phone}</span>
              </div>
            )}
            {address && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats / Summary */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Resumo</h2>
          <div className="space-y-3">
            {/* school_admin stats */}
            {profile.stats && (
              <>
                <SummaryItem icon={BookOpen} color="emerald" value={profile.stats.classes} label="Turmas" />
                <SummaryItem icon={Users} color="amber" value={profile.stats.students} label="Alunos" />
                <SummaryItem icon={GraduationCap} color="rose" value={profile.stats.teachers} label="Professores" />
              </>
            )}
            {/* teacher */}
            {profile.teacher && (
              <>
                <SummaryItem icon={BookOpen} color="emerald" value={profile.teacher.classes.length} label={`Turma${profile.teacher.classes.length !== 1 ? "s" : ""}`} />
                <SummaryItem icon={GraduationCap} color="amber" value={profile.teacher.subjects.length} label={`Disciplina${profile.teacher.subjects.length !== 1 ? "s" : ""}`} />
              </>
            )}
            {/* student */}
            {profile.student && (
              <>
                {profile.student.gender && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">{profile.student.gender}</span>
                  </div>
                )}
                <SummaryItem icon={BookOpen} color="emerald" value={profile.student.resultsCount} label="Notas registadas" />
              </>
            )}
            {/* parent */}
            {profile.parent && (
              <>
                <SummaryItem icon={Users} color="amber" value={profile.parent.students.length} label={`Educando${profile.parent.students.length !== 1 ? "s" : ""}`} />
                {profile.parent.students.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 pl-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{s.name}{s.className ? ` (${s.className})` : ""}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryItem({ icon: Icon, color, value, label }: { icon: React.ElementType; color: string; value: number; label: string }) {
  const bgMap: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/40",
    amber: "bg-amber-50 dark:bg-amber-950/40",
    rose: "bg-rose-50 dark:bg-rose-950/40",
    indigo: "bg-indigo-50 dark:bg-indigo-950/40",
  }
  const textMap: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
  }
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg ${bgMap[color] || bgMap.indigo} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${textMap[color] || textMap.indigo}`} />
      </div>
      <div>
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{value}</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400 ml-1">{label}</span>
      </div>
    </div>
  )
}

export default ProfilePage
