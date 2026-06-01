import { Suspense } from "react"
import Verify2FAClient from "./Verify2FAClient"

export default function Verify2FAPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm mx-auto" />}>
      <Verify2FAClient />
    </Suspense>
  )
}
