import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import UserMenu from "@/components/user-menu"

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch current user's role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const isAdmin = profile?.role === 'admin'

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-primary">
            🏸 Badminton Club
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link href="/sessions" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Buổi đánh
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <UserMenu 
            userName={user.user_metadata?.full_name || user.email || "Khách"} 
            isAdmin={isAdmin} 
          />
        </div>
      </div>
    </header>
  )
}

