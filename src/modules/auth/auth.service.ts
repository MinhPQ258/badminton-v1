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
