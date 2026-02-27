"use client";

import { useState } from "react";
import { ProjectInstallmentsSection } from "./project-installments";
import { ProjectReceiptsSection } from "./project-receipts-section";
import { ProjectExpensesSection } from "./project-expenses-section";
import { ProjectDocumentsSection } from "./project-documents-section";

type TabId = "installments" | "receipts" | "expenses" | "documents";

type Installment = {
  id: string;
  label: string;
  amount: { toString(): string };
  dueDate: Date;
  sortOrder: number;
};

type Deposit = {
  id: string;
  amount: { toString(): string };
  paidAt: Date;
  reference: string | null;
  receiptNumber: string | null;
  paymentMethod: string | null;
  accountNo: string | null;
  notes: string | null;
};

type ExpenseItem = {
  id: string;
  materials: string;
  quantity: { toString(): string };
  unitPrice: { toString(): string };
};

type ExpenseDocument = {
  id: string;
  name: string;
  fileUrl: string;
  mimeType: string;
  createdAt: Date;
};

type Expense = {
  id: string;
  title: string;
  amount: { toString(): string };
  expenseDate: Date;
  items: ExpenseItem[];
  documents: ExpenseDocument[];
};

type ProjectDocument = {
  id: string;
  name: string;
  fileUrl: string;
  mimeType: string;
  createdAt: Date;
};

const TABS: { id: TabId; label: string }[] = [
  { id: "expenses", label: "Expenses" },
  { id: "receipts", label: "Receipts" },
  { id: "installments", label: "Installments" },
  { id: "documents", label: "Documents" },
];

export function ProjectDetailTabs({
  projectId,
  projectName,
  clientName,
  installments,
  deposits,
  expenses,
  documents,
  canAddExpense,
  tenantId,
  tenantName,
  tenantLogoUrl,
  tenantBusinessInfo,
}: {
  projectId: string;
  projectName: string;
  clientName: string | null;
  installments: Installment[];
  deposits: Deposit[];
  expenses: Expense[];
  documents: ProjectDocument[];
  canAddExpense: boolean;
  tenantId: string;
  tenantName: string;
  tenantLogoUrl: string | null;
  tenantBusinessInfo: string | null;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("expenses");

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Tab bar - responsive: horizontal scroll on small screens */}
      <div className="border-b border-slate-200">
        <nav
          className="flex gap-0 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-thin [-webkit-overflow-scrolling:touch] sm:overflow-x-visible"
          aria-label="Project sections"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] min-w-[120px] shrink-0 touch-manipulation border-b-2 px-4 py-3.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:min-w-0 sm:px-6 ${
                activeTab === tab.id
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 sm:p-6">
        {activeTab === "installments" && (
          <ProjectInstallmentsSection projectId={projectId} installments={installments} embedded />
        )}
        {activeTab === "receipts" && (
          <ProjectReceiptsSection
            projectId={projectId}
            deposits={deposits}
            projectName={projectName}
            clientName={clientName}
            tenantName={tenantName}
            tenantLogoUrl={tenantLogoUrl}
            tenantBusinessInfo={tenantBusinessInfo}
          />
        )}
        {activeTab === "expenses" && (
          <ProjectExpensesSection
            projectId={projectId}
            expenses={expenses}
            canAddExpense={canAddExpense}
            tenantId={tenantId}
          />
        )}
        {activeTab === "documents" && (
          <ProjectDocumentsSection
            projectId={projectId}
            documents={documents}
            tenantId={tenantId}
          />
        )}
      </div>
    </div>
  );
}
