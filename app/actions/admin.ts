"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@prisma/client";

const STATUSES: ProjectStatus[] = [
  "DRAFT",
  "ACTIVE",
  "FUNDED",
  "COMPLETED",
  "CANCELLED",
];

// Action достижим прямым POST-запросом — всегда перепроверяем права здесь,
// а не только в UI страницы.
async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user || !isAdminEmail(data.user.email)) {
    redirect("/admin");
  }
}

function projectDataFromForm(formData: FormData) {
  const statusRaw = String(formData.get("status") ?? "DRAFT");
  const status = STATUSES.includes(statusRaw as ProjectStatus)
    ? (statusRaw as ProjectStatus)
    : "DRAFT";
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();

  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    photoUrl: photoUrl || null,
    totalAmount: String(formData.get("totalAmount") ?? "0"),
    minInvestment: String(formData.get("minInvestment") ?? "100"),
    roiPercent: String(formData.get("roiPercent") ?? "0"),
    durationMonths: parseInt(String(formData.get("durationMonths") ?? "1"), 10),
    status,
  };
}

export async function createProject(formData: FormData) {
  await requireAdmin();

  const project = await prisma.project.create({
    data: projectDataFromForm(formData),
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/admin/${project.id}/edit?created=1`);
}

export async function updateProject(projectId: string, formData: FormData) {
  await requireAdmin();

  await prisma.project.update({
    where: { id: projectId },
    data: projectDataFromForm(formData),
  });

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/admin");
  redirect(`/admin/${projectId}/edit?saved=1`);
}

export async function deleteProject(formData: FormData) {
  await requireAdmin();
  const projectId = String(formData.get("projectId") ?? "");
  if (!projectId) return;

  try {
    await prisma.project.delete({ where: { id: projectId } });
  } catch {
    // Скорее всего есть связанные инвестиции (FK) — удалять такой проект нельзя.
    redirect(
      `/admin?error=${encodeURIComponent(
        "Нельзя удалить проект, по которому уже есть инвестиции"
      )}`
    );
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}
