import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listAllUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw error;
  return data.users;
}

export async function getProfiles() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, fullName: string) {
  // Cập nhật user_metadata
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { full_name: fullName },
  });
  if (authError) throw authError;

  // Cập nhật bảng profiles
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (profileError) throw profileError;
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  if (error) throw error;
}

export async function deleteUser(userId: string) {
  // Xóa profile trước (nếu có foreign key constraints)
  await supabaseAdmin.from('profiles').delete().eq('id', userId);
  
  // Xóa auth user
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
}
