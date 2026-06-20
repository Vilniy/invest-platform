import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="border-b border-border bg-white px-6 py-5 dark:bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          Invest Platform
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/dashboard">Кабинет</Link>
          <Link href="/admin">Админка</Link>
          {user ? (
            <>
              <span className="text-foreground">{user.email}</span>
              <form action={logout}>
                <Button type="submit" variant="ghost" size="sm">
                  Выйти
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Войти</Link>
              <Button asChild size="sm">
                <Link href="/signup">Регистрация</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
