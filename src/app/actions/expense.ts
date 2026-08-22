"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { actionWrapper } from "@/lib/utils/action-wrapper"
import { addExpenseSchema } from "@/modules/expense/expense.schema"
import * as expenseService from "@/modules/expense/expense.service"
import { AppError } from "@/lib/utils/error"

export async function addExpenseAction(formData: FormData) {
  return actionWrapper(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AppError("Bạn phải đăng nhập", 401)

    const amountStr = formData.get("amount") as string
    const amount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10)

    const input = {
      sessionId: formData.get("session_id") as string,
      label: formData.get("label") as string,
      amount: isNaN(amount) ? -1 : amount,
    }

    const parsedInput = addExpenseSchema.parse(input)
    await expenseService.addExpense(parsedInput.sessionId, parsedInput.label, parsedInput.amount, user.id)
    revalidatePath(`/sessions/${parsedInput.sessionId}`)
  })
}

export async function deleteExpenseAction(expenseId: string, sessionId: string) {
  return actionWrapper(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AppError("Bạn phải đăng nhập", 401)

    await expenseService.deleteExpense(expenseId, sessionId, user.id)
    revalidatePath(`/sessions/${sessionId}`)
  })
}

export async function getExpensesForSession(sessionId: string) {
  return await expenseService.getExpensesForSession(sessionId)
}

export async function settleSessionAction(sessionId: string) {
  return actionWrapper(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AppError("Bạn phải đăng nhập", 401)

    // Call service to update status
    await expenseService.settleSession(sessionId, user.id)
    // Also perform the actual calculation to insert payments
    await expenseService.recalculateCost(sessionId, user.id)
    revalidatePath(`/sessions/${sessionId}`)
  })
}

export async function recalculateCostAction(sessionId: string) {
  return actionWrapper(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new AppError("Bạn phải đăng nhập", 401)

    await expenseService.recalculateCost(sessionId, user.id)
    revalidatePath(`/sessions/${sessionId}`)
  })
}

export async function getDebtSummaryAction(fromDate?: string, toDate?: string) {
  return await expenseService.getDebtSummary(fromDate, toDate)
}

export async function getSessionExpenseReportAction(fromDate?: string, toDate?: string) {
  return await expenseService.getSessionExpenseReport(fromDate, toDate)
}

