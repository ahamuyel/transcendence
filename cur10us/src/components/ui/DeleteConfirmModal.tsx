"use client"
import { useEffect, useRef, useState } from "react"
import { X, Trash2 } from "lucide-react"

type DeleteConfirmModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  itemName: string
  title?: string
  message?: string
  confirmLabel?: string
}

const DeleteConfirmModal = ({ open, onClose, onConfirm, itemName, title, message, confirmLabel }: DeleteConfirmModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-rose-600">{title || "Confirmar exclusão"}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {message || (<>Tem certeza que deseja excluir <strong className="text-zinc-900 dark:text-zinc-100">{itemName}</strong>? Esta ação não pode ser desfeita.</>)}
          </p>
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition disabled:opacity-50 shadow-lg shadow-rose-600/20"
            >
              <Trash2 size={14} />
              {loading ? "A processar..." : (confirmLabel || "Excluir")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
