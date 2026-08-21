import { createClient } from "@/lib/supabase/server";

export async function findUpcomingSessions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'upcoming')
    .order('start_time', { ascending: true });
    
  if (error) throw error;
  return data;
}

export async function findRecentSessions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .in('status', ['completed', 'settled'])
    .order('start_time', { ascending: false })
    .limit(5);
    
  if (error) throw error;
  return data;
}

export async function findSessionById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return null;
  return data;
}

export async function createSession(data: { start_time: string, end_time: string, venue: string, status: string, created_by: string }) {
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from('sessions')
    .insert(data)
    .select()
    .single();
    
  if (error) throw error;
  return session;
}
