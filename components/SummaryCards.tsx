import { formatCurrency } from "@/lib/calculations";
import type { MonthlySummary } from "@/lib/types";

export default function SummaryCards({ summary }: { summary: MonthlySummary }) {
  const cards = [
    {
      label: "Income",
      value: summary.income,
      valueColor: "text-emerald-600",
      accent: "bg-emerald-500",
    },
    {
      label: "Expenses",
      value: summary.expenses,
      valueColor: "text-rose-600",
      accent: "bg-rose-500",
    },
    {
      label: "Balance",
      value: summary.balance,
      valueColor: summary.balance >= 0 ? "text-gray-900" : "text-rose-600",
      accent: "bg-indigo-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
        >
          <div className={`h-0.5 ${c.accent}`} />
          <div className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {c.label}
            </p>
            <p
              className={`mt-2 text-2xl font-semibold tracking-tight ${c.valueColor}`}
            >
              {formatCurrency(c.value)}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">this month</p>
          </div>
        </div>
      ))}
    </div>
  );
}
