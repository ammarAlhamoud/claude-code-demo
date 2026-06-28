import BudgetsManager from "@/components/BudgetsManager";
import { getCategories, getTransactions } from "@/lib/data";
import { categorySpend } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  const spend = categorySpend(transactions, categories);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-gray-900">Budgets</h1>
      </header>
      <BudgetsManager categories={categories} spend={spend} />
    </div>
  );
}
