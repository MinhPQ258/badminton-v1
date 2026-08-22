"use server"

import { redirect } from "next/navigation";
import { actionWrapper } from "@/lib/utils/action-wrapper";
import { loginSchema, signupSchema } from "@/modules/auth/auth.schema";
import * as authService from "@/modules/auth/auth.service";

export async function loginAction(formData: FormData) {
  return actionWrapper(async () => {
    const input = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };
    
    const parsedInput = loginSchema.parse(input);
    await authService.login(parsedInput);
  });
}

export async function signupAction(formData: FormData) {
  return actionWrapper(async () => {
    const input = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      fullName: formData.get("fullName") as string,
    };
    
    const parsedInput = signupSchema.parse(input);
    await authService.signup(parsedInput);
  });
}

export async function logoutAction() {
  await authService.logout();
  redirect("/login");
}

export async function updateProfileAction(fullName: string) {
  return actionWrapper(async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Bạn phải đăng nhập");
    }

    if (!fullName || fullName.trim().length === 0) {
      throw new Error("Họ tên không được để trống");
    }

    await authService.updateProfile(user.id, fullName.trim());
  });
}

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  return actionWrapper(async () => {
    if (!currentPassword || !newPassword) {
      throw new Error("Vui lòng nhập đầy đủ thông tin");
    }
    if (newPassword.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    await authService.changePassword(currentPassword, newPassword);
  });
}

