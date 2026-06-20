import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProjectCard, type ProjectCardData } from "@/components/ProjectCard";

// Список проектов нужен свежим на каждый запрос (статусы и суммы меняются),
// поэтому не кэшируем страницу статически.
export const dynamic = "force-dynamic";

async function getProjects(): Promise<ProjectCardData[]> {
  const projects = await prisma.project.findMany({
    where: { status: { in: ["ACTIVE", "FUNDED"] } },
    orderBy: { createdAt: "desc" },
    include: {
      investments: {
        where: { status: { in: ["CONFIRMED", "ACTIVE", "PAID_OUT"] } },
        select: { amount: true },
      },
    },
  });

  return projects.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    location: p.location,
    photoUrl: p.photoUrl,
    totalAmount: Number(p.totalAmount),
    collectedAmount: p.investments.reduce(
      (sum, i) => sum + Number(i.amount),
      0
    ),
    roiPercent: Number(p.roiPercent),
    durationMonths: p.durationMonths,
    status: p.status,
  }));
}

export default async function Home() {
  const projects = await getProjects();

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
      <header className="border-b border-border bg-white px-6 py-5 dark:bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-semibold">Invest Platform</span>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/dashboard">Кабинет</Link>
            <Link href="/admin">Админка</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">
          Доступные объекты
        </h1>
        <p className="mb-8 text-muted-foreground">
          Выбери проект и стань совладельцем недвижимости от $100
        </p>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Проектов пока нет — добавь первый через админку.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
