"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/calculations";
import type { CategoryDTO, TransactionDTO, TxType } from "@/lib/types";

type Props = {
  initialTransactions: TransactionDTO[];
  categories: CategoryDTO[];
};

const todayIso = () => new Date().toISOString().slice(0, 10);

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

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
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
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function TransactionsManager({
  initialTransactions,
  categories,
}: Props) {
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");

  const [filterType, setFilterType] = useState<"all" | TxType>("all");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterNote, setFilterNote] = useState("");

  const categoriesForType = categories.filter((c) => c.type === type);

  const filterCategories =
    filterType === "all"
      ? categories
      : categories.filter((c) => c.type === filterType);

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterCategoryId && t.categoryId !== filterCategoryId) return false;
    if (filterNote && !t.note?.toLowerCase().includes(filterNote.toLowerCase()))
      return false;
    return true;
  });

  const totals = filteredTransactions.reduce(
    (acc, t) => {
      if (t.type === "income") acc.income += t.amount;
      else acc.expenses += t.amount;
      return acc;
    },
    { income: 0, expenses: 0 },
  );
  const net = totals.income - totals.expenses;

  // Group the filtered list by calendar month (UTC key from the ISO string).
  const monthGroups: { key: string; items: TransactionDTO[] }[] = [];
  const groupIndex = new Map<string, number>();
  for (const t of filteredTransactions) {
    const key = t.date.slice(0, 7); // YYYY-MM
    let idx = groupIndex.get(key);
    if (idx === undefined) {
      idx = monthGroups.length;
      groupIndex.set(key, idx);
      monthGroups.push({ key, items: [] });
    }
    monthGroups[idx].items.push(t);
  }

  function resetForm() {
    setEditingId(null);
    setType("expense");
    setAmount("");
    setCategoryId("");
    setDate(todayIso());
    setNote("");
  }

  async function reload() {
    const res = await fetch("/api/transactions");
    setTransactions(await res.json());
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      alert("Please enter a positive amount.");
      return;
    }
    if (!categoryId) {
      alert("Please pick a category.");
      return;
    }
    setBusy(true);
    const payload = { amount: amt, type, categoryId, date, note: note || null };
    const url = editingId
      ? `/api/transactions/${editingId}`
      : "/api/transactions";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "Something went wrong.");
      return;
    }
    resetForm();
    await reload();
  }

  function startEdit(t: TransactionDTO) {
    setEditingId(t.id);
    setType(t.type);
    setAmount(String(t.amount));
    setCategoryId(t.categoryId);
    setDate(t.date.slice(0, 10));
    setNote(t.note ?? "");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return;
    setBusy(true);
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setBusy(false);
    if (editingId === id) resetForm();
    await reload();
  }

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100";

  const filterInputCls =
    "rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="h-fit space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-6"
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors ${
              editingId
                ? "bg-amber-50 text-amber-600 ring-amber-100"
                : "bg-indigo-50 text-indigo-600 ring-indigo-100"
            }`}
          >
            {editingId ? (
              <PencilIcon className="h-4 w-4" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {editingId ? "Edit transaction" : "New transaction"}
            </h2>
            <p className="text-xs text-gray-400">
              {editingId ? "Update the details" : "Record income or an expense"}
            </p>
          </div>
        </div>

        {/* Type toggle */}
        <div className="flex rounded-lg border border-gray-200 p-0.5">
          {(["expense", "income"] as TxType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategoryId("");
              }}
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
            Amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${inputCls} pl-7`}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputCls}
          >
            <option value="">Select…</option>
            {categoriesForType.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Note
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputCls}
            placeholder="Optional"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {!editingId && <PlusIcon className="h-4 w-4" />}
            {editingId ? "Save" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-50 px-5 py-3.5">
          <h2 className="text-sm font-medium text-gray-500">
            All transactions
            <span className="ml-1.5 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400">
              {filteredTransactions.length}
            </span>
          </h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-gray-400">In</span>
              <span className="tabular-nums font-medium text-emerald-600">
                {formatCurrency(totals.income)}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span className="text-gray-400">Out</span>
              <span className="tabular-nums font-medium text-rose-600">
                {formatCurrency(totals.expenses)}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-gray-400">Net</span>
              <span
                className={`tabular-nums font-semibold ${
                  net >= 0 ? "text-gray-900" : "text-rose-600"
                }`}
              >
                {formatCurrency(net)}
              </span>
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-50 px-5 py-3">
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            {(["all", "expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setFilterType(t);
                  setFilterCategoryId("");
                }}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  filterType === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className={filterInputCls}
          >
            <option value="">All categories</option>
            {filterCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="relative min-w-[140px] flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filterNote}
              onChange={(e) => setFilterNote(e.target.value)}
              placeholder="Search notes…"
              className={`${filterInputCls} w-full pl-8`}
            />
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            {transactions.length === 0
              ? "No transactions yet."
              : "No transactions match the current filters."}
          </p>
        ) : (
          <div>
            {monthGroups.map((group) => {
              const groupNet = group.items.reduce(
                (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
                0,
              );
              return (
                <div key={group.key}>
                  <div className="flex items-center justify-between gap-4 border-b border-gray-50 bg-gray-50/50 px-5 py-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {monthLabel(group.key)}
                    </span>
                    <span
                      className={`tabular-nums text-xs font-medium ${
                        groupNet >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {groupNet >= 0 ? "+" : "−"}
                      {formatCurrency(Math.abs(groupNet))}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {group.items.map((t) => (
                      <li
                        key={t.id}
                        className="group flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-gray-50/60"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ring-1 ring-inset"
                            style={{
                              backgroundColor: `${t.category?.color}14`,
                              color: t.category?.color,
                              // @ts-expect-error CSS custom property for ring tint
                              "--tw-ring-color": `${t.category?.color}33`,
                            }}
                          >
                            {t.category?.name?.[0]?.toUpperCase() ?? "?"}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">
                              {t.category?.name}
                              {t.note && (
                                <span className="font-normal text-gray-400">
                                  {" "}
                                  · {t.note}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(t.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span
                            className={`tabular-nums text-sm font-semibold ${
                              t.type === "income"
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            {t.type === "income" ? "+" : "−"}
                            {formatCurrency(t.amount)}
                          </span>
                          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                            <button
                              onClick={() => startEdit(t)}
                              aria-label="Edit transaction"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              aria-label="Delete transaction"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
