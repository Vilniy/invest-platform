"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/supabase/ensure-user";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function redirectWithError(path: string, error: string): never {
  redirect(`${path}?error=${encodeURIComponent(error)}`);
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirectWithError("/login", "Заполни email и пароль");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirectWithError("/login", "Неверный email или пароль");
  }

  await ensureUserProfile(data.user);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) {
    redirectWithError("/signup", "Заполни email и пароль");
  }
  if (password.length < 6) {
    redirectWithError("/signup", "Пароль должен быть не короче 6 символов");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: name ? { full_name: name } : undefined,
      emailRedirectTo: `${APP_URL}/auth/callback`,
    },
  });

  if (error || !data.user) {
    redirectWithError("/signup", error?.message ?? "Не удалось зарегистрироваться");
  }

  if (data.session) {
    // Email-подтверждение отключено в Supabase — сессия выдаётся сразу.
    await ensureUserProfile(data.user);
    revalidatePath("/", "layout");
    redirect("/");
  }

  // Подтверждение почты включено — сессии пока нет, профиль создастся в /auth/callback.
  redirect("/login?message=" + encodeURIComponent("Проверь почту — мы отправили письмо для подтверждения"));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function loginWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${APP_URL}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirectWithError(
      "/login",
      "Google-логин не настроен в Supabase (Authentication → Providers)"
    );
  }

  redirect(data.url);
}
