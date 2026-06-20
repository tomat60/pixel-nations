"use client";

import Link from "next/link";

import { getDemoObjective, type ObjectiveStepStatus } from "../lib/demo-objective";
import type { SettlementState } from "../lib/settlement-state";

type DemoObjectivePanelProps = {
  state: SettlementState;
  variant?: "full" | "compact";
  eyebrow?: string;
  className?: string;
};

function stepTone(status: ObjectiveStepStatus) {
  if (status === "complete") {
    return {
      card: "border-emerald-400/25 bg-emerald-400/[0.06]",
      label: "text-emerald-100",
      detail: "text-emerald-200/60",
      marker: "bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.45)]",
    };
  }

  if (status === "current") {
    return {
      card: "border-amber-400/35 bg-amber-400/[0.08] shadow-[0_0_34px_rgba(201,169,98,0.12)]",
      label: "text-amber-100",
      detail: "text-amber-200/70",
      marker: "bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.55)]",
    };
  }

  return {
    card: "border-zinc-800 bg-[#08080f]/60",
    label: "text-zinc-500",
    detail: "text-zinc-600",
    marker: "bg-zinc-700",
  };
}

export default function DemoObjectivePanel({
  state,
  variant = "full",
  eyebrow = "Demo Progression Spine",
  className = "",
}: DemoObjectivePanelProps) {
  const objective = getDemoObjective(state);
  const { action, steps, spineLine, completedCount } = objective;
  const isCompact = variant === "compact";

  return (
    <section
      data-qa="demo-objective-panel"
      className={`border border-amber-500/25 bg-amber-500/[0.045] shadow-[0_20px_90px_rgba(0,0,0,0.45)] ${isCompact ? "p-4 sm:p-5" : "p-5 sm:p-6"} ${className}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">{eyebrow}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">{spineLine}</p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/75">
          {completedCount} / {steps.length} complete
        </p>
      </div>

      <div
        data-qa="progression-area"
        className={`mt-5 grid gap-2 ${isCompact ? "sm:grid-cols-3 lg:grid-cols-6" : "sm:grid-cols-2 lg:grid-cols-6"}`}
      >
        {steps.map((step) => {
          const tone = stepTone(step.status);

          return (
            <div key={step.id} className={`border p-3 ${tone.card}`}>
              <div className="flex items-center gap-2">
                <span className={`size-2 shrink-0 rounded-full ${tone.marker}`} aria-hidden />
                <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${tone.label}`}>{step.label}</p>
              </div>
              <p className={`mt-2 text-[10px] uppercase tracking-[0.14em] ${tone.detail}`}>{step.detail}</p>
              {step.value ? (
                <p className="mt-2 truncate text-xs font-semibold text-zinc-200" title={step.value}>
                  {step.value}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        data-qa="dashboard-next-action"
        className={`mt-6 border border-amber-500/15 bg-[#06060c]/88 ${isCompact ? "p-4" : "p-5 sm:p-6"}`}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500/75">
          Step {action.stepNumber} / Next Action
        </p>
        <h2
          className={`mt-3 font-[family-name:var(--font-syne)] font-extrabold tracking-tight text-amber-100 ${
            isCompact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
          }`}
        >
          {action.headline}
        </h2>
        <p className={`mt-3 max-w-2xl leading-7 text-zinc-400 ${isCompact ? "text-xs sm:text-sm" : "text-sm"}`}>
          {action.description}
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.22em] text-zinc-500">Progress: {action.progress}</p>
        <Link
          href={action.href}
          className="btn-primary mt-5 inline-flex rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
        >
          {action.cta}
        </Link>
      </div>
    </section>
  );
}
