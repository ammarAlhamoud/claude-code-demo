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
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Your finances at a glance.</p>
      </header>

      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-slate-800">
            Spending by category
          </h2>
          <CategoryPieChart data={spend} />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Recent activity</h2>
            <Link
              href="/transactions"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No transactions yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: t.category?.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {t.category?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
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
