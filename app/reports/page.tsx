import CategoryPieChart from "@/components/charts/CategoryPieChart";
import TrendBarChart from "@/components/charts/TrendBarChart";
import { getCategories, getTransactions } from "@/lib/data";
import {
  categorySpend,
  formatCurrency,
  monthlyTrend,
} from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  const spend = categorySpend(transactions, categories);
  const trend = monthlyTrend(transactions, 6);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
      </header>

      <section className="rounded-xl border border-gray-100 shadow-sm bg-white p-5">
        <h2 className="mb-4 text-sm font-medium text-gray-500">
          Income vs expenses (last 6 months)
        </h2>
        <TrendBarChart data={trend} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-100 shadow-sm bg-white p-5">
          <h2 className="mb-4 text-sm font-medium text-gray-500">
            Spending by category (this month)
          </h2>
          <CategoryPieChart data={spend} />
        </section>

        <section className="rounded-xl border border-gray-100 shadow-sm bg-white p-5">
          <h2 className="mb-4 text-sm font-medium text-gray-500">
            Category breakdown
          </h2>
          <ul className="divide-y divide-slate-100">
            {spend
              .filter((s) => s.spent > 0)
              .map((s) => (
                <li
                  key={s.categoryId}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span className="text-sm text-slate-700">{s.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">
                    {formatCurrency(s.spent)}
                    {s.limit != null && (
                      <span className="text-slate-400">
                        {" "}
                        / {formatCurrency(s.limit)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            {spend.every((s) => s.spent === 0) && (
              <p className="py-6 text-center text-sm text-slate-400">
                No expenses recorded this month.
              </p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
