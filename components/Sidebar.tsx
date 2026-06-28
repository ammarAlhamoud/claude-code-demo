"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconDashboard() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    </svg>
  );
}

function IconTransactions() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 4.5h10M9 2l3 2.5L9 7" />
      <path d="M14 11.5H4M7 9l-3 2.5L7 14" />
    </svg>
  );
}

function IconBudgets() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="8" cy="8" r="6.5" />
      <circle cx="8" cy="8" r="2.5" />
    </svg>
  );
}

function IconReports() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M2 13V8M5.5 13V5M9 13V9M12.5 13V3M0.5 13h15" />
    </svg>
  );
}

const links = [
  { href: "/", label: "Dashboard", icon: <IconDashboard /> },
  { href: "/transactions", label: "Transactions", icon: <IconTransactions /> },
  { href: "/budgets", label: "Budgets", icon: <IconBudgets /> },
  { href: "/reports", label: "Reports", icon: <IconReports /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M1 9V5M4 9V2M7 9V6M10 9V3" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            Budgeteer
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-indigo-50 font-medium text-indigo-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="shrink-0">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
