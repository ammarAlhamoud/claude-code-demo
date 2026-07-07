import Link from "next/link";
import SummaryCards from "@/components/SummaryCards";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import { getCategories, getTransactions } from "@/lib/data";
import {
  categorySpend,
  formatCurrency,
  formatDate,
  monthlySummary,
} from "@/lib/calculations";

export const dynamic = "force-dynamic";

const monthLabel = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date());

export default async function DashboardPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  const summary = monthlySummary(transactions);
  const spend = categorySpend(transactions, categories);
  const recent = transactions.slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          {monthLabel}
        </span>
      </header>

      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-medium text-gray-500">
            Spending by category
          </h2>
          <CategoryPieChart data={spend} />
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">
              Recent activity
            </h2>
            <Link
              href="/transactions"
              className="group inline-flex items-center gap-1 text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-800"
            >
              View all
              <svg
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No transactions yet.
            </p>
          ) : (
            <ul className="-mx-2 space-y-0.5">
              {recent.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${t.category?.color}1a` }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: t.category?.color }}
                      />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {t.category?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      t.type === "income" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
