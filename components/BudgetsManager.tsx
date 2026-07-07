"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/calculations";
import type { CategoryDTO, CategorySpend, TxType } from "@/lib/types";

type Props = {
  categories: CategoryDTO[];
  spend: CategorySpend[];
};

const PALETTE = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#16a34a",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

function progressColor(ratio: number) {
  if (ratio >= 1) return "bg-rose-500";
  if (ratio >= 0.8) return "bg-amber-400";
  return "bg-indigo-500";
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CoinsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="9" cy="7" rx="6" ry="3" />
      <path d="M3 7v5c0 1.66 2.69 3 6 3s6-1.34 6-3V7" />
      <path d="M3 12v5c0 1.66 2.69 3 6 3 1.1 0 2.13-.15 3-.4" />
      <path d="M15 11.5c2.5.3 6 1.5 6 3.5 0 1.66-2.69 3-6 3s-6-1.34-6-3" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v1" />
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2Z" />
      <circle cx="16" cy="13" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export default function BudgetsManager({ categories, spend }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<TxType>("expense");
  const [limit, setLimit] = useState("");
  const [color, setColor] = useState(PALETTE[0]);

  const spendByCat = new Map(spend.map((s) => [s.categoryId, s]));
  const expenseCats = categories.filter((c) => c.type === "expense");
  const incomeCats = categories.filter((c) => c.type === "income");

  // Budget overview — totals across expense categories that have a limit set.
  const budgetedCats = expenseCats.filter((c) => c.monthlyLimit != null);
  const totalBudget = budgetedCats.reduce(
    (sum, c) => sum + (c.monthlyLimit ?? 0),
    0,
  );
  const totalSpent = budgetedCats.reduce(
    (sum, c) => sum + (spendByCat.get(c.id)?.spent ?? 0),
    0,
  );
  const remaining = totalBudget - totalSpent;
  const overallRatio = totalBudget > 0 ? totalSpent / totalBudget : 0;

  const overview = [
    {
      label: "Budgeted",
      value: totalBudget,
      valueColor: "text-gray-900",
      iconWrap: "bg-indigo-50 text-indigo-600 ring-indigo-100",
      glow: "from-indigo-100/60",
      Icon: TargetIcon,
      caption: `${budgetedCats.length} categor${
        budgetedCats.length === 1 ? "y" : "ies"
      } with a limit`,
    },
    {
      label: "Spent",
      value: totalSpent,
      valueColor: "text-rose-600",
      iconWrap: "bg-rose-50 text-rose-600 ring-rose-100",
      glow: "from-rose-100/60",
      Icon: CoinsIcon,
      caption:
        totalBudget > 0
          ? `${Math.round(overallRatio * 100)}% of budget used`
          : "No budgets set yet",
    },
    {
      label: "Remaining",
      value: remaining,
      valueColor: remaining >= 0 ? "text-emerald-600" : "text-rose-600",
      iconWrap: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      glow: "from-emerald-100/60",
      Icon: WalletIcon,
      caption: remaining >= 0 ? "Left to spend" : "Over budget",
    },
  ];

  async function refresh() {
    router.refresh();
  }

  async function updateLimit(id: string, value: string) {
    const parsed = value === "" ? null : parseFloat(value);
    if (parsed !== null && (!Number.isFinite(parsed) || parsed < 0)) return;
    setBusy(true);
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyLimit: parsed }),
    });
    setBusy(false);
    refresh();
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a category name.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        type,
        color,
        monthlyLimit: type === "expense" && limit ? parseFloat(limit) : null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "Could not create category.");
      return;
    }
    setName("");
    setLimit("");
    refresh();
  }

  async function deleteCategory(id: string, catName: string) {
    if (!confirm(`Delete "${catName}"? Its transactions will also be removed.`))
      return;
    setBusy(true);
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setBusy(false);
    refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="space-y-8">
      {/* Budget overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {overview.map((c) => (
          <div
            key={c.label}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            <div
              className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${c.glow} to-transparent blur-2xl`}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {c.label}
                </p>
                <p
                  className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums ${c.valueColor}`}
                >
                  {formatCurrency(c.value)}
                </p>
              </div>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${c.iconWrap}`}
              >
                <c.Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="relative mt-4 text-xs text-gray-400">{c.caption}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Expense budgets */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500">
                Expense budgets
              </h2>
              {totalBudget > 0 && (
                <span className="tabular-nums text-xs text-gray-400">
                  {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
                </span>
              )}
            </div>
            <ul className="space-y-1">
              {expenseCats.map((c) => {
                const s = spendByCat.get(c.id);
                const spent = s?.spent ?? 0;
                const hasLimit = c.monthlyLimit != null;
                const ratio = c.monthlyLimit ? spent / c.monthlyLimit : 0;
                const pct = Math.round(ratio * 100);
                return (
                  <li
                    key={c.id}
                    className="rounded-xl px-2 py-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold uppercase"
                          style={{
                            background: `${c.color}1a`,
                            color: c.color,
                          }}
                        >
                          {c.name.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-800">
                            {c.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {hasLimit ? `${pct}% used` : "No limit set"}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="tabular-nums text-sm text-gray-400">
                          {formatCurrency(spent)}
                        </span>
                        <span className="text-gray-200">/</span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          defaultValue={c.monthlyLimit ?? ""}
                          onBlur={(e) => updateLimit(c.id, e.target.value)}
                          placeholder="—"
                          className="w-20 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-right text-sm tabular-nums text-gray-700 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                        <button
                          onClick={() => deleteCategory(c.id, c.name)}
                          className="rounded-md p-1 text-gray-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                          aria-label={`Delete ${c.name}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          hasLimit ? progressColor(ratio) : "bg-gray-200"
                        }`}
                        style={{
                          width: hasLimit
                            ? `${Math.min(ratio * 100, 100)}%`
                            : "0%",
                        }}
                      />
                    </div>
                    {hasLimit && ratio >= 1 && (
                      <p className="mt-1.5 text-xs font-medium text-rose-500">
                        Over by {formatCurrency(spent - c.monthlyLimit!)}
                      </p>
                    )}
                  </li>
                );
              })}
              {expenseCats.length === 0 && (
                <li className="py-8 text-center text-sm text-gray-400">
                  No expense categories yet.
                </li>
              )}
            </ul>
          </div>

          {/* Income categories */}
          {incomeCats.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-medium text-gray-500">
                Income categories
              </h2>
              <ul className="flex flex-wrap gap-2">
                {incomeCats.map((c) => (
                  <li
                    key={c.id}
                    className="group flex items-center gap-2 rounded-full border border-gray-200 py-1 pl-3 pr-2 text-sm text-gray-700 transition-colors hover:border-gray-300"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: c.color }}
                    />
                    {c.name}
                    <button
                      onClick={() => deleteCategory(c.id, c.name)}
                      className="rounded-full p-0.5 text-gray-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                      aria-label={`Delete ${c.name}`}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      >
                        <path d="M1 1l10 10M11 1L1 11" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Add category */}
        <form
          onSubmit={addCategory}
          className="h-fit space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <PlusIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                New category
              </h2>
              <p className="text-xs text-gray-400">Track income or spending</p>
            </div>
          </div>

          <div className="flex rounded-lg border border-gray-200 p-0.5">
            {(["expense", "income"] as TxType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium capitalize transition-colors ${
                  type === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="e.g. Subscriptions"
            />
          </div>

          {type === "expense" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Monthly limit
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className={`${inputCls} pl-7`}
                  placeholder="Optional"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full ring-2 ring-offset-1 transition ${
                    color === c ? "ring-indigo-500" : "ring-transparent"
                  }`}
                  style={{ background: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            Add category
          </button>
        </form>
      </div>
    </div>
  );
}
