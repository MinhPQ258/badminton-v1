"use client"

import { useState, useEffect } from "react"
import { CalendarDays, Filter, TrendingDown, ChevronDown, ChevronUp, Receipt, Users } from "lucide-react"
import { getDebtSummaryAction, getSessionExpenseReportAction } from "@/app/actions/expense"

interface DebtItem {
  userId: string
  totalDue: number
  totalPaid: number
  debt: number
}

interface SessionExpense {
  id: string
  start_time: string
  venue: string
  status: string
  total_cost: number | null
  total_attendees: number | null
  cost_per_person: number | null
  expenses: Array<{
    id: string
    label: string
    amount: number
    created_at: string
  }>
}

interface ExpensesClientProps {
  profiles: Array<{ id: string; full_name: string }>
  initialDebts: DebtItem[]
  initialSessions: SessionExpense[]
}

export default function ExpensesClient({ profiles, initialDebts, initialSessions }: ExpensesClientProps) {
  const [debts, setDebts] = useState(initialDebts)
  const [sessions, setSessions] = useState(initialSessions)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"debts" | "sessions">("debts")

  const profileMap = new Map(profiles.map(p => [p.id, p.full_name]))

  const getName = (userId: string) => profileMap.get(userId) || "Không rõ"

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ"
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric"
    })
  }

  const getInitial = (name: string) => name.charAt(0).toUpperCase()
  const getColor = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
      "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-pink-500",
    ]
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const handleFilter = async () => {
    setLoading(true)
    const [newDebts, newSessions] = await Promise.all([
      getDebtSummaryAction(fromDate || undefined, toDate || undefined),
      getSessionExpenseReportAction(fromDate || undefined, toDate || undefined),
    ])
    setDebts(newDebts)
    setSessions(newSessions)
    setLoading(false)
  }

  const handleQuickFilter = async (period: string) => {
    const now = new Date()
    let from = ""
    const to = now.toISOString()

    switch (period) {
      case "week": {
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        from = weekAgo.toISOString()
        break
      }
      case "month": {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        from = monthStart.toISOString()
        break
      }
      case "3months": {
        const threeMonths = new Date(now)
        threeMonths.setMonth(threeMonths.getMonth() - 3)
        from = threeMonths.toISOString()
        break
      }
      case "all": {
        from = ""
        break
      }
    }

    setFromDate(from ? from.slice(0, 10) : "")
    setToDate(period === "all" ? "" : to.slice(0, 10))

    setLoading(true)
    const [newDebts, newSessions] = await Promise.all([
      getDebtSummaryAction(from || undefined, period === "all" ? undefined : to),
      getSessionExpenseReportAction(from || undefined, period === "all" ? undefined : to),
    ])
    setDebts(newDebts)
    setSessions(newSessions)
    setLoading(false)
  }

  // Sort debts by amount descending
  const sortedDebts = [...debts].filter(d => d.debt > 0).sort((a, b) => b.debt - a.debt)
  const totalDebt = sortedDebts.reduce((sum, d) => sum + d.debt, 0)

  return (
    <div className="flex-1 max-w-lg mx-auto w-full">
      {/* Filter Section */}
      <div className="bg-card border-b border-border p-4 space-y-3">
        {/* Quick filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { label: "Tuần này", value: "week" },
            { label: "Tháng này", value: "month" },
            { label: "3 tháng", value: "3months" },
            { label: "Tất cả", value: "all" },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => handleQuickFilter(f.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors whitespace-nowrap"
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Từ ngày"
            />
          </div>
          <span className="text-muted-foreground text-sm">→</span>
          <div className="flex-1">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Đến ngày"
            />
          </div>
          <button
            onClick={handleFilter}
            disabled={loading}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border bg-card sticky top-14 z-20">
        <button
          onClick={() => setActiveTab("debts")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "debts" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <TrendingDown className="w-4 h-4" />
            Công nợ ({sortedDebts.length})
          </span>
          {activeTab === "debts" && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "sessions" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Receipt className="w-4 h-4" />
            Theo buổi ({sessions.length})
          </span>
          {activeTab === "sessions" && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
        </button>
      </div>

      {loading && (
        <div className="p-4 text-center text-sm text-muted-foreground">thinking...</div>
      )}

      {/* Debts Tab */}
      {!loading && activeTab === "debts" && (
        <div className="p-4 space-y-3">
          {/* Total summary */}
          {sortedDebts.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-4 mb-4">
              <p className="text-xs text-muted-foreground mb-1">Tổng công nợ</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totalDebt)}</p>
            </div>
          )}

          {sortedDebts.map(debt => {
            const name = getName(debt.userId)
            return (
              <div key={debt.userId} className="bg-card rounded-xl border border-border p-3.5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${getColor(name)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {getInitial(name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">Phải đóng: {formatCurrency(debt.totalDue)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-destructive">{formatCurrency(debt.debt)}</p>
                  <p className="text-[10px] text-muted-foreground">chưa đóng</p>
                </div>
              </div>
            )
          })}

          {sortedDebts.length === 0 && (
            <div className="py-12 text-center">
              <TrendingDown className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Không có công nợ nào</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Tất cả đã thanh toán đầy đủ 🎉</p>
            </div>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {!loading && activeTab === "sessions" && (
        <div className="p-4 space-y-3">
          {sessions.map(session => {
            const isExpanded = expandedSession === session.id

            return (
              <div key={session.id} className="bg-card rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                  className="w-full p-3.5 flex items-center gap-3 text-left hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">{formatDate(session.start_time)}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        session.status === 'settled' 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        {session.status === 'settled' ? 'Đã chốt' : 'Hoàn thành'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {session.total_cost != null && (
                        <span>Tổng: {formatCurrency(session.total_cost)}</span>
                      )}
                      {session.total_attendees != null && (
                        <span className="flex items-center gap-0.5">
                          <Users className="w-3 h-3" /> {session.total_attendees}
                        </span>
                      )}
                      {session.cost_per_person != null && (
                        <span className="font-medium text-foreground">{formatCurrency(session.cost_per_person)}/người</span>
                      )}
                    </div>
                  </div>
                  {session.expenses.length > 0 && (
                    isExpanded 
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> 
                      : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Expanded expense details */}
                {isExpanded && session.expenses.length > 0 && (
                  <div className="border-t border-border bg-secondary/30">
                    {session.expenses.map((expense, i) => (
                      <div key={expense.id} className={`px-4 py-2.5 flex justify-between items-center text-sm ${
                        i < session.expenses.length - 1 ? 'border-b border-border/50' : ''
                      }`}>
                        <span className="text-muted-foreground">{expense.label}</span>
                        <span className="font-medium text-foreground">{formatCurrency(expense.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {sessions.length === 0 && (
            <div className="py-12 text-center">
              <Receipt className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Không có dữ liệu chi phí</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Thử thay đổi khoảng thời gian lọc</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
