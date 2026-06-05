import { ShieldCheck } from "lucide-react"

export function TrustBadge() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mt-5">
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>Os seus dados estão protegidos com encriptação</span>
    </div>
  )
}
