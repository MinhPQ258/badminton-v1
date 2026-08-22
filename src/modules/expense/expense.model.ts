import { createClient } from "@/lib/supabase/server";

export async function insertExpense(sessionId: string, label: string, amount: number, createdBy: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('session_expenses')
    .insert({ session_id: sessionId, label, amount, created_by: createdBy });
  if (error) throw error;
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('session_expenses').delete().eq('id', expenseId);
  if (error) throw error;
}

export async function getExpensesForSession(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('session_expenses')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateSessionStatus(sessionId: string, status: string, userId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('sessions').update({ 
    status,
    settled_at: new Date().toISOString(),
    settled_by: userId
  }).eq('id', sessionId);
  if (error) throw error;
}

export async function getDebtSummary(fromDate?: string, toDate?: string) {
  const supabase = await createClient();
  
  // Lấy tất cả payments
  let paymentsQuery = supabase
    .from('member_payments')
    .select('user_id, amount_due, payment_status, session_id, sessions!inner(start_time, status)');

  if (fromDate) {
    paymentsQuery = paymentsQuery.gte('sessions.start_time', fromDate);
  }
  if (toDate) {
    paymentsQuery = paymentsQuery.lte('sessions.start_time', toDate);
  }

  const { data: payments, error } = await paymentsQuery;
  if (error) throw error;
  return payments || [];
}

export async function getSessionExpenseReport(fromDate?: string, toDate?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('sessions')
    .select('id, start_time, venue, status, total_cost, total_attendees, cost_per_person, settled_at')
    .in('status', ['completed', 'settled'])
    .order('start_time', { ascending: false });

  if (fromDate) {
    query = query.gte('start_time', fromDate);
  }
  if (toDate) {
    query = query.lte('start_time', toDate);
  }

  const { data: sessions, error } = await query;
  if (error) throw error;
  return sessions || [];
}

export async function getExpenseDetailsForSessions(sessionIds: string[]) {
  if (sessionIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('session_expenses')
    .select('*')
    .in('session_id', sessionIds)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

