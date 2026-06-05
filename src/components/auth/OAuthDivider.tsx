export function OAuthDivider({ label = "ou continue com" }: { label?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400">{label}</span>
      </div>
    </div>
  )
}
