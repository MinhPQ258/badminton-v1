import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AppError } from "@/lib/utils/error";
import { LoginInput, SignupInput } from "./auth.schema";

export async function login(input: LoginInput) {
  const email = `${input.username.toLowerCase()}@badminton.local`;
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (error) {
    throw new AppError(error.message, 401);
  }
}

export async function signup(input: SignupInput) {
  const email = `${input.username.toLowerCase()}@badminton.local`;
  
  // Sử dụng Admin API để tạo user và tự động confirm email
  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName,
    }
  });

  if (createError) {
    throw new AppError(createError.message, 400);
  }
  
  // Đăng nhập ngay sau khi tạo thành công
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (signInError) {
    throw new AppError(signInError.message, 401);
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function updateProfile(userId: string, fullName: string) {
  // Cập nhật user_metadata qua Admin API
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { full_name: fullName },
  });
  if (updateError) {
    throw new AppError("Lỗi khi cập nhật thông tin: " + updateError.message, 500);
  }

  // Cập nhật bảng profiles
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (profileError) {
    throw new AppError("Lỗi khi cập nhật profile: " + profileError.message, 500);
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new AppError("Bạn phải đăng nhập", 401);

  // Verify mật khẩu hiện tại bằng cách đăng nhập lại
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });
  if (verifyError) {
    throw new AppError("Mật khẩu hiện tại không đúng", 400);
  }

  // Cập nhật mật khẩu mới qua Admin API
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });
  if (updateError) {
    throw new AppError("Lỗi khi đổi mật khẩu: " + updateError.message, 500);
  }
}

