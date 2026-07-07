import BudgetsManager from "@/components/BudgetsManager";
import { getCategories, getTransactions } from "@/lib/data";
import { categorySpend } from "@/lib/calculations";

export const dynamic = "force-dynamic";

const monthLabel = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date());

export default async function BudgetsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  const spend = categorySpend(transactions, categories);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Budgets
        </h1>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          {monthLabel}
        </span>
      </header>
      <BudgetsManager categories={categories} spend={spend} />
    </div>
  );
}
