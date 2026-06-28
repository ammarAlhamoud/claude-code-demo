"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/calculations";
import type { CategorySpend } from "@/lib/types";

export default function CategoryPieChart({ data }: { data: CategorySpend[] }) {
  const chartData = data.filter((d) => d.spent > 0);

  if (chartData.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-slate-400">
        No expenses recorded this month.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="spent"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(entry) => entry.name}
        >
          {chartData.map((entry) => (
            <Cell key={entry.categoryId} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
