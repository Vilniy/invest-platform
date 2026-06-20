import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// В Next.js 16 файл middleware.ts переименован в proxy.ts (экспорт proxy
// вместо middleware), поведение и API запроса/ответа не изменились.
// Здесь обновляем (refresh) сессию Supabase на каждый запрос — это
// обязательный паттерн для @supabase/ssr в SSR-фреймворках.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Обращение к getUser() триггерит обновление протухшего access token
  // и запись новых cookie через setAll выше.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
