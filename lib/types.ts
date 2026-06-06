export type TxType = "income" | "expense";

export type CategoryDTO = {
  id: string;
  name: string;
  type: TxType;
  monthlyLimit: number | null;
  color: string;
};

export type TransactionDTO = {
  id: string;
  amount: number;
  type: TxType;
  date: string; // ISO date string
  note: string | null;
  categoryId: string;
  category?: CategoryDTO;
};

export type MonthlySummary = {
  income: number;
  expenses: number;
  balance: number;
};

export type CategorySpend = {
  categoryId: string;
  name: string;
  color: string;
  spent: number;
  limit: number | null;
};

export type TrendPoint = {
  month: string; // e.g. "2026-06"
  label: string; // e.g. "Jun"
  income: number;
  expenses: number;
};
