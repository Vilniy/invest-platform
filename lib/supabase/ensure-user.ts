import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

// Supabase Auth хранит пользователей в своей служебной таблице auth.users.
// Для инвестиций/CRM нам нужна запись в нашей таблице users (Prisma) с тем
// же id — синхронизируем её при каждом логине/коллбэке (upsert идемпотентен).
export async function ensureUserProfile(user: SupabaseUser) {
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;

  await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email ?? undefined,
      ...(name ? { name } : {}),
    },
    create: {
      id: user.id,
      email: user.email ?? `${user.id}@unknown.local`,
      name,
    },
  });
}
