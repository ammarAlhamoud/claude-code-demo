import { formatCurrency } from "@/lib/calculations";
import type { MonthlySummary } from "@/lib/types";

function TrendUpIcon({ className }: { className?: string }) {
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
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
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
      <path d="M7 7 17 17" />
      <path d="M17 8v9H8" />
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

export default function SummaryCards({ summary }: { summary: MonthlySummary }) {
  const savingsRate =
    summary.income > 0
      ? Math.round((summary.balance / summary.income) * 100)
      : null;

  const cards = [
    {
      label: "Income",
      value: summary.income,
      valueColor: "text-emerald-600",
      iconWrap: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      glow: "from-emerald-100/60",
      Icon: TrendUpIcon,
      caption: "Received this month",
    },
    {
      label: "Expenses",
      value: summary.expenses,
      valueColor: "text-rose-600",
      iconWrap: "bg-rose-50 text-rose-600 ring-rose-100",
      glow: "from-rose-100/60",
      Icon: TrendDownIcon,
      caption: "Spent this month",
    },
    {
      label: "Balance",
      value: summary.balance,
      valueColor: summary.balance >= 0 ? "text-gray-900" : "text-rose-600",
      iconWrap: "bg-indigo-50 text-indigo-600 ring-indigo-100",
      glow: "from-indigo-100/60",
      Icon: WalletIcon,
      caption:
        savingsRate !== null
          ? `${savingsRate}% of income saved`
          : "Net this month",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => (
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
  );
}
