import Link from "next/link";
import { Button } from "@/components/ui/button";
import { login, signup, loginWithGoogle } from "@/app/actions/auth";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AuthForm({
  mode,
  error,
  message,
}: {
  mode: "login" | "signup";
  error?: string;
  message?: string;
}) {
  const isSignup = mode === "signup";
  const action = isSignup ? signup : login;

  return (
    <div className="mx-auto w-full max-w-sm rounded-xl border border-border bg-card p-6">
      <h1 className="text-xl font-semibold">
        {isSignup ? "Регистрация" : "Вход"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isSignup
          ? "Создай аккаунт, чтобы инвестировать в проекты"
          : "Войди, чтобы продолжить"}
      </p>

      {message && (
        <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <form action={action} className="mt-5 flex flex-col gap-3">
        {isSignup && (
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              Имя
            </label>
            <input name="name" className={inputClass} placeholder="Твоё имя" />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            Пароль
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className={inputClass}
            placeholder="Минимум 6 символов"
          />
        </div>
        <Button type="submit" className="mt-2 w-full">
          {isSignup ? "Зарегистрироваться" : "Войти"}
        </Button>
      </form>

      <form action={loginWithGoogle} className="mt-3">
        <Button type="submit" variant="outline" className="w-full">
          Войти через Google
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        {isSignup ? (
          <>
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-foreground underline">
              Войти
            </Link>
          </>
        ) : (
          <>
            Нет аккаунта?{" "}
            <Link href="/signup" className="font-medium text-foreground underline">
              Зарегистрироваться
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
