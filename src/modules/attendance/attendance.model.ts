import { createClient } from "@/lib/supabase/server";

export async function getAttendancesForSession(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('session_attendances')
    .select('*')
    .eq('session_id', sessionId);
  if (error) throw error;
  return data;
}

export async function getExistingAttendance(sessionId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('session_attendances')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .single();
  return data;
}

export async function updateAttendance(id: string, attended: boolean, markedBy: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('session_attendances')
    .update({ attended, marked_by: markedBy, marked_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function insertAttendance(sessionId: string, userId: string, attended: boolean, markedBy: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('session_attendances')
    .insert({
      session_id: sessionId,
      user_id: userId,
      attended,
      marked_by: markedBy,
      marked_at: new Date().toISOString()
    });
  if (error) throw error;
}
