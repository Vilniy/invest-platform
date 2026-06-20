import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Project, ProjectStatus } from "@prisma/client";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "DRAFT", label: "Черновик (не виден на сайте)" },
  { value: "ACTIVE", label: "Сбор инвестиций" },
  { value: "FUNDED", label: "Сбор завершён" },
  { value: "COMPLETED", label: "Проект завершён" },
  { value: "CANCELLED", label: "Отменён" },
];

export function ProjectForm({
  action,
  project,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  project?: Project;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Название">
        <input
          name="title"
          required
          defaultValue={project?.title}
          className={inputClass}
        />
      </Field>

      <Field label="Локация (адрес/район)">
        <input
          name="location"
          required
          defaultValue={project?.location}
          className={inputClass}
        />
      </Field>

      <Field label="Описание">
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={project?.description}
          className={inputClass + " h-auto py-2"}
        />
      </Field>

      <Field label="URL фото (необязательно)">
        <input
          name="photoUrl"
          defaultValue={project?.photoUrl ?? ""}
          placeholder="https://..."
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Сумма сбора, USD">
          <input
            name="totalAmount"
            type="number"
            min={1}
            step="0.01"
            required
            defaultValue={project ? Number(project.totalAmount) : undefined}
            className={inputClass}
          />
        </Field>
        <Field label="Мин. инвестиция, USD">
          <input
            name="minInvestment"
            type="number"
            min={1}
            step="0.01"
            required
            defaultValue={
              project ? Number(project.minInvestment) : 100
            }
            className={inputClass}
          />
        </Field>
        <Field label="Доходность, % годовых">
          <input
            name="roiPercent"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={project ? Number(project.roiPercent) : undefined}
            className={inputClass}
          />
        </Field>
        <Field label="Срок, месяцев">
          <input
            name="durationMonths"
            type="number"
            min={1}
            step="1"
            required
            defaultValue={project?.durationMonths}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Статус">
        <select
          name="status"
          defaultValue={project?.status ?? "DRAFT"}
          className={inputClass}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Button type="submit" className="mt-2">
        {submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
