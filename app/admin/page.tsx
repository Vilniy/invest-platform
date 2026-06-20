import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { STATUS_LABEL, formatUSD } from "@/lib/project";
import { deleteProject } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; deleted?: string; error?: string }>;
}) {
  const { created, deleted, error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 text-center">
          <p className="text-muted-foreground">
            Нужно войти, чтобы открыть админку.
          </p>
          <Button asChild className="mt-4">
            <Link href="/login">Войти</Link>
          </Button>
        </main>
      </div>
    );
  }

  if (!isAdminEmail(data.user.email)) {
    return (
      <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 text-center">
          <p className="text-muted-foreground">
            У аккаунта {data.user.email} нет доступа к админке.
          </p>
        </main>
      </div>
    );
  }

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      investments: {
        where: { status: { in: ["CONFIRMED", "ACTIVE", "PAID_OUT"] } },
        select: { amount: true },
      },
    },
  });

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Проекты ({projects.length})
          </h1>
          <Button asChild>
            <Link href="/admin/new">
              <Plus className="size-4" />
              Добавить проект
            </Link>
          </Button>
        </div>

        {created && (
          <p className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm">
            Проект создан.
          </p>
        )}
        {deleted && (
          <p className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm">
            Проект удалён.
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Проект</th>
                <th className="px-4 py-2.5 font-medium">Статус</th>
                <th className="px-4 py-2.5 font-medium">Собрано</th>
                <th className="px-4 py-2.5 font-medium" />
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const collected = p.investments.reduce(
                  (sum, i) => sum + Number(i.amount),
                  0
                );
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/${p.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {p.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {p.location}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">{STATUS_LABEL[p.status]}</td>
                    <td className="px-4 py-2.5">
                      {formatUSD(collected)} / {formatUSD(Number(p.totalAmount))}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/admin/${p.id}/edit`}
                        className="mr-3 text-muted-foreground hover:text-foreground"
                      >
                        Изменить
                      </Link>
                      <form action={deleteProject} className="inline">
                        <input type="hidden" name="projectId" value={p.id} />
                        <button
                          type="submit"
                          className="text-destructive hover:underline"
                        >
                          Удалить
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {projects.length === 0 && (
            <p className="px-4 py-8 text-center text-muted-foreground">
              Проектов пока нет.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
