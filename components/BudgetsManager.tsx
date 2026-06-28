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
  "#ef4444", "#f97316", "#eab308", "#16a34a",
  "#06b6d4", "#3b82f6", "#a855f7", "#ec4899",
];

function progressColor(ratio: number) {
  if (ratio >= 1) return "bg-red-500";
  if (ratio >= 0.8) return "bg-amber-500";
  return "bg-green-500";
}

export default function BudgetsManager({ categories, spend }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // New-category form
  const [name, setName] = useState("");
  const [type, setType] = useState<TxType>("expense");
  const [limit, setLimit] = useState("");
  const [color, setColor] = useState(PALETTE[0]);

  const spendByCat = new Map(spend.map((s) => [s.categoryId, s]));
  const expenseCats = categories.filter((c) => c.type === "expense");
  const incomeCats = categories.filter((c) => c.type === "income");

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
    if (
      !confirm(
        `Delete "${catName}"? Its transactions will also be removed.`
      )
    )
      return;
    setBusy(true);
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setBusy(false);
    refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      {/* Expense budgets */}
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-800">
            Expense budgets (this month)
          </h2>
          <ul className="space-y-5">
            {expenseCats.map((c) => {
              const s = spendByCat.get(c.id);
              const spent = s?.spent ?? 0;
              const ratio = c.monthlyLimit ? spent / c.monthlyLimit : 0;
              return (
                <li key={c.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ background: c.color }}
                      />
                      <span className="text-sm font-medium text-slate-800">
                        {c.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">
                        {formatCurrency(spent)} /
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        defaultValue={c.monthlyLimit ?? ""}
                        onBlur={(e) => updateLimit(c.id, e.target.value)}
                        placeholder="no limit"
                        className="w-24 rounded-md border border-slate-300 px-2 py-1 text-right text-sm"
                      />
                      <button
                        onClick={() => deleteCategory(c.id, c.name)}
                        className="text-xs font-medium text-red-500 hover:underline"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        c.monthlyLimit ? progressColor(ratio) : "bg-slate-300"
                      }`}
                      style={{
                        width: c.monthlyLimit
                          ? `${Math.min(ratio * 100, 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                  {c.monthlyLimit != null && ratio >= 1 && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      Over budget by {formatCurrency(spent - c.monthlyLimit)}
                    </p>
                  )}
                </li>
              );
            })}
            {expenseCats.length === 0 && (
              <p className="text-sm text-slate-400">
                No expense categories yet.
              </p>
            )}
          </ul>
        </div>

        {incomeCats.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-800">
              Income categories
            </h2>
            <ul className="flex flex-wrap gap-2">
              {incomeCats.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: c.color }}
                  />
                  {c.name}
                  <button
                    onClick={() => deleteCategory(c.id, c.name)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ✕
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
        className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="font-semibold text-slate-800">Add category</h2>

        <div className="flex gap-2">
          {(["expense", "income"] as TxType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
                type === t
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 text-slate-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
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
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Monthly limit (optional)
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className={inputCls}
              placeholder="0.00"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full ring-2 ring-offset-1 transition ${
                  color === c ? "ring-slate-900" : "ring-transparent"
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
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Add category
        </button>
      </form>
    </div>
  );
}
