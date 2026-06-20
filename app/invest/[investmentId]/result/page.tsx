import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { checkOrderStatus } from "@/lib/liqpay";
import { applyLiqpayStatus } from "@/lib/payments";

export const dynamic = "force-dynamic";

export default async function InvestmentResultPage({
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

  if (!investment || investment.userId !== authData.user.id) {
    notFound();
  }

  let paid = investment.status === "CONFIRMED";

  if (investment.status === "PENDING") {
    try {
      const liqpayStatus = await checkOrderStatus(investment.id);
      const paymentStatus = await applyLiqpayStatus(investment.id, liqpayStatus);
      paid = paymentStatus === "SUCCESS";
    } catch {
      // LiqPay временно недоступен — оставляем PENDING, юзер может обновить страницу.
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-16 text-center">
        <div className="rounded-xl border border-border bg-card p-6">
          {paid ? (
            <>
              <h1 className="text-xl font-semibold">Оплата прошла успешно</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Инвестиция в «{investment.project.title}» подтверждена.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">Оплата не подтверждена</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Если ты уже оплатил — обнови страницу через несколько секунд.
                Если нет — вернись и попробуй снова.
              </p>
            </>
          )}

          <div className="mt-5 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href={`/invest/${investment.id}`}>Обновить</Link>
            </Button>
            <Button asChild>
              <Link href={`/projects/${investment.projectId}`}>К проекту</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
