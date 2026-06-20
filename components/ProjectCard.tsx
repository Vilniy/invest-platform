import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, TrendingUp } from "lucide-react";
import type { ProjectStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

export type ProjectCardData = {
  id: string;
  title: string;
  description: string;
  location: string;
  photoUrl: string | null;
  totalAmount: number;
  collectedAmount: number;
  roiPercent: number;
  durationMonths: number;
  status: ProjectStatus;
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: "Черновик",
  ACTIVE: "Сбор инвестиций",
  FUNDED: "Сбор завершён",
  COMPLETED: "Проект завершён",
  CANCELLED: "Отменён",
};

function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const progress =
    project.totalAmount > 0
      ? Math.min(
          100,
          Math.round((project.collectedAmount / project.totalAmount) * 100)
        )
      : 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] w-full bg-muted">
        {project.photoUrl ? (
          <Image
            src={project.photoUrl}
            alt={project.title}
            fill
            className="object-cover"
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

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 font-semibold">{project.title}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {project.location}
          </p>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <TrendingUp className="size-3.5" />
            {project.roiPercent}% годовых
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3.5" />
            {project.durationMonths} мес.
          </span>
        </div>

        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>{formatUSD(project.collectedAmount)} собрано</span>
            <span>
              {progress}% из {formatUSD(project.totalAmount)}
            </span>
          </div>
        </div>

        <Button asChild className="mt-1 w-full">
          <Link href={`/projects/${project.id}`}>Инвестировать</Link>
        </Button>
      </div>
    </div>
  );
}
