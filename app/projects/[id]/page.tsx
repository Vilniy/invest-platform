import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Clock, TrendingUp, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABEL, formatUSD, progressPercent } from "@/lib/project";

// Детали проекта должны быть свежими (сумма сбора меняется), без статического кэша.
export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      investments: {
        where: { status: { in: ["CONFIRMED", "ACTIVE", "PAID_OUT"] } },
        select: { amount: true, userId: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const collectedAmount = project.investments.reduce(
    (sum, i) => sum + Number(i.amount),
    0
  );
  const totalAmount = Number(project.totalAmount);
  const roiPercent = Number(project.roiPercent);
  const progress = progressPercent(collectedAmount, totalAmount);
  const investorsCount = new Set(project.investments.map((i) => i.userId))
    .size;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(authData.user);

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <Link
          href="/"
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Все проекты
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
              {project.photoUrl ? (
                <Image
                  src={project.photoUrl}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Нет фото
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
                {STATUS_LABEL[project.status]}
              </span>
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              {project.title}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="size-4" />
              {project.location}
            </p>

            <p className="mt-5 whitespace-pre-line text-foreground/90">
              {project.description}
            </p>
          </div>

          <aside className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold">
                {formatUSD(collectedAmount)}
              </span>
              <span className="text-sm text-muted-foreground">
                из {formatUSD(totalAmount)}
              </span>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {progress}% собрано
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="size-3.5" />
                  Доходность
                </dt>
                <dd className="mt-0.5 font-medium">{roiPercent}%</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3.5" />
                  Срок
                </dt>
                <dd className="mt-0.5 font-medium">
                  {project.durationMonths} мес.
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Мин. вход</dt>
                <dd className="mt-0.5 font-medium">
                  {formatUSD(Number(project.minInvestment))}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <Users className="size-3.5" />
                  Инвесторов
                </dt>
                <dd className="mt-0.5 font-medium">{investorsCount}</dd>
              </div>
            </dl>

            {isLoggedIn ? (
              <>
                <Button disabled className="mt-6 w-full">
                  Инвестировать
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Форма инвестиции появится на следующем шаге
                </p>
              </>
            ) : (
              <>
                <Button asChild className="mt-6 w-full">
                  <Link href="/login">Войти, чтобы инвестировать</Link>
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Нужен аккаунт — это бесплатно и быстро
                </p>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
