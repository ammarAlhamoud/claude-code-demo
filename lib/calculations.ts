import type {
  CategorySpend,
  MonthlySummary,
  TransactionDTO,
  TrendPoint,
} from "./types";

/**
 * Returns the [start, end) UTC bounds of the month containing `ref`.
 * Transaction dates are stored as UTC instants (calendar dates entered by the
 * user become UTC midnight), so bucketing is done in UTC to keep month
 * membership consistent regardless of the server's local timezone.
 */
export function monthBounds(ref: Date = new Date()) {
  const start = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1));
  const end = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + 1, 1));
  return { start, end };
}

export function isInMonth(dateIso: string, ref: Date = new Date()): boolean {
  const { start, end } = monthBounds(ref);
  const d = new Date(dateIso);
  return d >= start && d < end;
}

/** Income, expenses and balance for the month containing `ref`. */
export function monthlySummary(
  transactions: TransactionDTO[],
  ref: Date = new Date()
): MonthlySummary {
  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (!isInMonth(t.date, ref)) continue;
    if (t.type === "income") income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, balance: income - expenses };
}

/**
 * Spending per expense category for the month containing `ref`, including the
 * configured monthly limit (if any). Only expense categories are returned.
 */
export function categorySpend(
  transactions: TransactionDTO[],
  categories: { id: string; name: string; color: string; type: string; monthlyLimit: number | null }[],
  ref: Date = new Date()
): CategorySpend[] {
  const spentByCat = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense" || !isInMonth(t.date, ref)) continue;
    spentByCat.set(t.categoryId, (spentByCat.get(t.categoryId) ?? 0) + t.amount);
  }

  return categories
    .filter((c) => c.type === "expense")
    .map((c) => ({
      categoryId: c.id,
      name: c.name,
      color: c.color,
      spent: spentByCat.get(c.id) ?? 0,
      limit: c.monthlyLimit,
    }))
    .sort((a, b) => b.spent - a.spent);
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Income vs expense totals for the last `count` months ending with `ref`. */
export function monthlyTrend(
  transactions: TransactionDTO[],
  count = 6,
  ref: Date = new Date()
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const summary = monthlySummary(transactions, d);
    points.push({
      month: key,
      label: MONTH_LABELS[d.getUTCMonth()],
      income: summary.income,
      expenses: summary.expenses,
    });
  }
  return points;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Formats a stored ISO date for display. Uses the UTC calendar date so the
 * shown day matches the date the user entered and the month it is bucketed in
 * (dates are stored as UTC midnight).
 */
export function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString("en-US", { timeZone: "UTC" });
}
