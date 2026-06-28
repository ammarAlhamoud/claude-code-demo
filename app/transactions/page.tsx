import TransactionsManager from "@/components/TransactionsManager";
import { getCategories, getTransactions } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="text-sm text-slate-500">
          Record and manage your income and expenses.
        </p>
      </header>
      <TransactionsManager
        initialTransactions={transactions}
        categories={categories}
      />
    </div>
  );
}
