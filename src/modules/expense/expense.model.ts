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
