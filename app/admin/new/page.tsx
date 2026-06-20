import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { SiteHeader } from "@/components/SiteHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { createProject } from "@/app/actions/admin";

export default async function NewProjectPage() {
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
          Новый проект
        </h1>
        <ProjectForm action={createProject} submitLabel="Создать проект" />
      </main>
    </div>
  );
}
