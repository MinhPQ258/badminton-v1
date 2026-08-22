import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getDebtSummaryAction, getSessionExpenseReportAction } from "@/app/actions/expense"
import ExpensesClient from "./expenses-client"

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch initial data (tất cả, không filter)
  const [debts, sessions] = await Promise.all([
    getDebtSummaryAction(),
    getSessionExpenseReportAction(),
  ])

  // Fetch profiles cho mapping userId -> tên
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-lg font-semibold text-foreground">Chi phí</h1>
        </div>
      </header>

      <ExpensesClient
        profiles={profiles || []}
        initialDebts={debts}
        initialSessions={sessions}
      />
    </div>
  )
}
