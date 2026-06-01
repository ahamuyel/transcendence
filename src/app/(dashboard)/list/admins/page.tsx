"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import AdminForm from "@/components/forms/AdminForm"
import { useEntityList } from "@/hooks/useEntityList"
import { Pencil, Trash2, SlidersHorizontal, ArrowUpDown, UserPlus, Loader2, Shield, ShieldCheck } from "lucide-react"

type AdminPermissions = {
  canManageApplications: boolean
  canManageTeachers: boolean
  canManageStudents: boolean
  canManageParents: boolean
  canManageClasses: boolean
  canManageCourses: boolean
  canManageSubjects: boolean
  canManageLessons: boolean
  canManageExams: boolean
  canManageAssignments: boolean
  canManageResults: boolean
  canManageAttendance: boolean
  canManageMessages: boolean
  canManageAnnouncements: boolean
  canManageAdmins: boolean
}

type Admin = {
  id: string
  name: string
  email: string
  level: "primary" | "secondary"
  isActive: boolean
  permissions: AdminPermissions
}

const columns = [
  { header: "Nome", accessor: "name" },
  { header: "E-mail", accessor: "email", className: "hidden md:table-cell" },
  { header: "Nivel", accessor: "level" },
  { header: "Estado", accessor: "status", className: "hidden sm:table-cell" },
  { header: "Acoes", accessor: "actions" },
]

const AdminListPage = () => {
  const { data: session } = useSession()
  const canManage = session?.user?.role === "school_admin" && (
    session.user.adminLevel === "primary" ||
    session.user.permissions?.includes("canManageAdmins")
  )

  const { data, totalPages, page, search, setSearch, setPage, loading, refetch } = useEntityList<Admin>({ endpoint: "/api/admins", limit: 10 })

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Admin | null>(null)
  const [deleteItem, setDeleteItem] = useState<Admin | null>(null)

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/admins/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  const renderRow = (item: Admin) => (
    <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/50 text-sm hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            {item.name.charAt(0)}
          </div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-xs sm:text-sm max-w-[120px] sm:max-w-none">
            {item.name}
          </span>
        </div>
      </td>
      <td className="hidden md:table-cell text-zinc-600 dark:text-zinc-400 text-xs">
        {item.email}
      </td>
      <td className="py-2.5 sm:py-3 px-1.5 sm:px-2">
        {item.level === "primary" ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] sm:text-xs font-bold uppercase">
            <ShieldCheck size={12} />
            Principal
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] sm:text-xs font-bold uppercase">
            <Shield size={12} />
            Secundario
          </span>
        )}
      </td>
      <td className="hidden sm:table-cell py-2.5 sm:py-3 px-1.5 sm:px-2">
        {item.isActive ? (
          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] sm:text-xs font-bold">
            Activo
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg text-[10px] sm:text-xs font-bold">
            Inactivo
          </span>
        )}
      </td>
      <td className="px-1.5 sm:px-2">
        <div className="flex items-center gap-1 justify-end">
          {item.level === "secondary" && canManage && (
            <>
              <button
                onClick={() => setEditItem(item)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => setDeleteItem(item)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-rose-600 hover:text-white transition-all active:scale-90"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
          {item.level === "primary" && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 italic">Protegido</span>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="m-2 sm:m-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-0 lg:flex-row lg:items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Administradores</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400">Gerencie os administradores da sua escola</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 sm:w-56 md:w-64">
            <TableSearch value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <button className="p-2 sm:p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition active:scale-95">
              <SlidersHorizontal size={16} />
            </button>
            <button className="p-2 sm:p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition active:scale-95">
              <ArrowUpDown size={16} />
            </button>
            {canManage && (
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs sm:text-sm active:scale-95 shadow-lg shadow-indigo-600/20 transition"
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2.5 px-2.5 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">Nenhum administrador encontrado</div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {!loading && data.length > 0 && (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Administrador">
        <AdminForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Administrador">
        {editItem && (
          <AdminForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.name || ""} />
    </div>
  )
}

export default AdminListPage
