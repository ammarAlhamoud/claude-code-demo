import { formatCurrency } from "@/lib/calculations";
import type { MonthlySummary } from "@/lib/types";

export default function SummaryCards({ summary }: { summary: MonthlySummary }) {
  const cards = [
    {
      label: "Income (this month)",
      value: summary.income,
      accent: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Expenses (this month)",
      value: summary.expenses,
      accent: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Balance",
      value: summary.balance,
      accent: summary.balance >= 0 ? "text-slate-900" : "text-red-600",
      bg: "bg-slate-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-xl border border-slate-200 ${c.bg} p-5`}
        >
          <p className="text-sm font-medium text-slate-500">{c.label}</p>
          <p className={`mt-2 text-2xl font-bold ${c.accent}`}>
            {formatCurrency(c.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
