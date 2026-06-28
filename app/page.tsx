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
      <header>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      </header>

      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-medium text-gray-500">
            Spending by category
          </h2>
          <CategoryPieChart data={spend} />
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">
              Recent activity
            </h2>
            <Link
              href="/transactions"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No transactions yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recent.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: t.category?.color }}
                    />
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
                    className={`text-sm font-medium tabular-nums ${
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
