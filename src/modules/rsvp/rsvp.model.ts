import { createClient } from "@/lib/supabase/server";

export async function getExistingRSVP(sessionId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('session_rsvps')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .single();
  return data;
}

export async function deleteRSVP(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('session_rsvps').delete().eq('id', id);
  if (error) throw error;
}

export async function updateRSVP(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('session_rsvps')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function insertRSVP(sessionId: string, userId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('session_rsvps')
    .insert({
      session_id: sessionId,
      user_id: userId,
      status,
      responded_at: new Date().toISOString()
    });
  if (error) throw error;
}

export async function getRSVPsForSession(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('session_rsvps')
    .select(`*, profiles ( full_name )`)
    .eq('session_id', sessionId)
    .order('responded_at', { ascending: false });
  if (error) throw error;
  return data;
}
