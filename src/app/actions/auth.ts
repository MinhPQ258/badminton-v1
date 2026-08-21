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
