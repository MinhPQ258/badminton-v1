import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SettingsClient from "./settings-client"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const fullName = user.user_metadata?.full_name || "Chưa cập nhật"
  const email = user.email || ""
  const username = email.split("@")[0] || "unknown"

  return (
    <SettingsClient
      user={{
        fullName,
        username,
        email,
      }}
    />
  )
}
