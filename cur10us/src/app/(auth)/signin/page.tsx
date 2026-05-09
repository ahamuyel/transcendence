import { Suspense } from "react"
import SignInClient from "./SignInClient"

export default function Page() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm mx-auto" />}>
      <SignInClient />
    </Suspense>
  )
}