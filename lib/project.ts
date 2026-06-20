import type { ProjectStatus } from "@prisma/client";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: "Черновик",
  ACTIVE: "Сбор инвестиций",
  FUNDED: "Сбор завершён",
  COMPLETED: "Проект завершён",
  CANCELLED: "Отменён",
};

export function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function progressPercent(collected: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((collected / total) * 100));
}
