import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase-клиент для Server Components / Server Actions / Route Handlers.
// Создавать новый клиент на каждый рендер — не шарить между запросами.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Вызов из Server Component, где cookies можно только читать —
            // обновление сессии в этом случае берёт на себя proxy.ts.
          }
        },
      },
    }
  );
}
