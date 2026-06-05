import { cookies } from "next/headers"
import { LOCALE_COOKIE } from "./index"

export async function getServerLocale(): Promise<string> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get(LOCALE_COOKIE)?.value || "pt"
  } catch {
    return "pt"
  }
}
