import { createClient } from "@/lib/supabase/server";

export async function insertGuest(sessionId: string, name: string, addedBy: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('session_guests')
    .insert({ session_id: sessionId, name, added_by: addedBy });
  if (error) throw error;
}

export async function deleteGuest(guestId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('session_guests').delete().eq('id', guestId);
  if (error) throw error;
}

export async function getGuestsForSession(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('session_guests')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}
