import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { SiteHeader } from "@/components/SiteHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { updateProject, deleteProject } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { created, saved } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user || !isAdminEmail(data.user.email)) {
    return (
      <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 text-center text-muted-foreground">
          Нет доступа.
        </main>
      </div>
    );
  }

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    notFound();
  }

  const updateProjectWithId = updateProject.bind(null, project.id);

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <Link
          href="/admin"
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />К списку проектов
        </Link>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          {project.title}
        </h1>

        {created && (
          <p className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm">
            Проект создан, можно отредактировать детали ниже.
          </p>
        )}
        {saved && (
          <p className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm">
            Изменения сохранены.
          </p>
        )}

        <ProjectForm
          action={updateProjectWithId}
          project={project}
          submitLabel="Сохранить"
        />

        <form action={deleteProject} className="mt-6">
          <input type="hidden" name="projectId" value={project.id} />
          <button
            type="submit"
            className="text-sm text-destructive hover:underline"
          >
            Удалить проект
          </button>
        </form>
      </main>
    </div>
  );
}
