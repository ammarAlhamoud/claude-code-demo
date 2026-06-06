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

  const categoriesForType = categories.filter((c) => c.type === type);

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
    router.refresh(); // keep dashboard/server data in sync
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
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="font-semibold text-slate-800">
          {editingId ? "Edit transaction" : "Add transaction"}
        </h2>

        <div className="flex gap-2">
          {(["expense", "income"] as TxType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategoryId("");
              }}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
                type === t
                  ? t === "income"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-red-600 bg-red-50 text-red-700"
                  : "border-slate-300 text-slate-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputCls}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
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
          <label className="mb-1 block text-xs font-medium text-slate-500">
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
          <label className="mb-1 block text-xs font-medium text-slate-500">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputCls}
            placeholder="e.g. weekly shop"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {editingId ? "Save changes" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="font-semibold text-slate-800">
            All transactions ({transactions.length})
          </h2>
        </div>
        {transactions.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">
            No transactions yet — add one on the left.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-4 px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: t.category?.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {t.category?.name}
                      {t.note && (
                        <span className="font-normal text-slate-400">
                          {" "}
                          · {t.note}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(t.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-sm font-semibold ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                  <button
                    onClick={() => startEdit(t)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
