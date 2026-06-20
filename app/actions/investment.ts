"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/supabase/ensure-user";
import { prisma } from "@/lib/prisma";

function back(projectId: string, message: string): never {
  redirect(`/projects/${projectId}?error=${encodeURIComponent(message)}`);
}

export async function createInvestment(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const amount = Number(formData.get("amount"));

  if (!projectId) {
    redirect("/");
  }

  // Server Action доступен через прямой POST, поэтому всегда перепроверяем
  // авторизацию и бизнес-правила здесь, а не доверяем только UI.
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect("/login");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      investments: {
        where: { status: { in: ["CONFIRMED", "ACTIVE", "PAID_OUT"] } },
        select: { amount: true },
      },
    },
  });

  if (!project) {
    redirect("/");
  }

  if (project.status !== "ACTIVE") {
    back(projectId, "Сбор по этому проекту закрыт");
  }

  const minInvestment = Number(project.minInvestment);
  const totalAmount = Number(project.totalAmount);
  const collected = project.investments.reduce(
    (sum, i) => sum + Number(i.amount),
    0
  );
  const remaining = totalAmount - collected;

  if (!Number.isFinite(amount) || amount <= 0) {
    back(projectId, "Укажи корректную сумму");
  }
  if (amount < minInvestment) {
    back(projectId, `Минимальная сумма — ${minInvestment} USD`);
  }
  if (amount > remaining) {
    back(projectId, `Осталось собрать всего ${remaining.toFixed(2)} USD`);
  }

  await ensureUserProfile(authData.user);

  const investment = await prisma.investment.create({
    data: {
      userId: authData.user.id,
      projectId,
      amount,
      currency: "USD",
      status: "PENDING",
    },
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/invest/${investment.id}`);
}
