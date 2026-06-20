import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { buildCheckoutPayload } from "@/lib/liqpay";
import { formatUSD } from "@/lib/project";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function InvestmentPage({
  params,
}: {
  params: Promise<{ investmentId: string }>;
}) {
  const { investmentId } = await params;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect("/login");
  }

  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: { project: true },
  });

  // Не раскрываем существование чужих инвестиций — просто 404.
  if (!investment || investment.userId !== authData.user.id) {
    notFound();
  }

  const amount = Number(investment.amount);
  const payload = buildCheckoutPayload({
    orderId: investment.id,
    amount,
    currency: investment.currency,
    description: `Инвестиция в проект "${investment.project.title}"`,
    resultUrl: `${APP_URL}/invest/${investment.id}/result`,
    serverUrl: `${APP_URL}/api/liqpay/callback`,
  });

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-10">
        <Link
          href={`/projects/${investment.projectId}`}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Назад к проекту
        </Link>

        <div className="rounded-xl border border-border bg-card p-6">
          <h1 className="text-xl font-semibold">Заявка на инвестицию</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {investment.project.title}
          </p>

          <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">К оплате</span>
            <span className="text-2xl font-semibold">{formatUSD(amount)}</span>
          </div>

          {investment.status !== "PENDING" ? (
            <p className="mt-5 rounded-lg bg-muted px-3 py-2 text-sm">
              Статус заявки: {investment.status}. Оплата уже обработана.
            </p>
          ) : (
            <>
              <form method="POST" action={payload.checkoutUrl} className="mt-5">
                <input type="hidden" name="data" value={payload.data} />
                <input type="hidden" name="signature" value={payload.signature} />
                <Button type="submit" className="w-full">
                  Оплатить через LiqPay
                </Button>
              </form>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Тестовый режим (sandbox) — реальные деньги не списываются
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
