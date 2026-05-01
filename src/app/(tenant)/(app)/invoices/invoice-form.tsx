"use client";

import { useState, useMemo, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createInvoice, updateInvoice } from "./actions";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useFormAlert } from "@/components/useFormAlert";

type Project = {
  id: string;
  name: string;
  installments: { id: string; label: string; amount: number; dueDate: Date }[];
};

type Company = {
  id: string;
  name: string;
  logoUrl?: string | null;
  isDefault?: boolean;
};

type Invoice = {
  id: string;
  invoiceNumber: string | null;
  projectId: string | null;
  companyId: string | null;
  installmentId: string | null;
  issueDate: Date;
  dueDate: Date;
  recipientName: string | null;
  recipientAddress: string | null;
  notes: string | null;
  terms: string | null;
  discount: any;
  taxRate: any;
  shipping: any;
  status: string;
  items: { id: string; description: string; quantity: any; unitPrice: any; amount: any }[];
};

type InvoiceFormProps = {
  projects: Project[];
  companies: Company[];
  initialProjectId?: string;
  initialInstallmentId?: string;
  nextInvoiceNumber?: string;
  invoice?: Invoice;
};

function SubmitButton({ isEdit }: { isEdit?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-teal-600 text-white px-10 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2"
    >
      {pending && (
        <svg className="h-4 w-4 shrink-0 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {pending ? (isEdit ? "Saving..." : "Generating...") : (isEdit ? "Save Changes" : "Generate Invoice")}
    </button>
  );
}

export function InvoiceForm({ projects, companies, initialProjectId, initialInstallmentId, nextInvoiceNumber, invoice }: InvoiceFormProps) {
  const isEdit = !!invoice;
  const [state, formAction] = useFormState(
    isEdit ? updateInvoice.bind(null, invoice.id) : createInvoice, 
    null
  );
  useFormAlert(state);
  const router = useRouter();

  const defaultCompany = companies.find(c => c.isDefault);
  const [projectId, setProjectId] = useState(invoice?.projectId || initialProjectId || "");
  const [companyId, setCompanyId] = useState(invoice?.companyId || defaultCompany?.id || "");
  const [installmentId, setInstallmentId] = useState(invoice?.installmentId || initialInstallmentId || "");
  const [invoiceNumber, setInvoiceNumber] = useState(invoice?.invoiceNumber || nextInvoiceNumber || "");
  const [items, setItems] = useState<{ id: string, description: string, quantity: number, unitPrice: number, taxRate?: number }[]>(
    invoice ? invoice.items.map(item => ({ ...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) })) : [
      { id: Math.random().toString(), description: "", quantity: 1, unitPrice: 0 }
    ]
  );
  const [discount, setDiscount] = useState(invoice ? Number(invoice.discount) : 0);
  const [taxRate, setTaxRate] = useState(invoice ? Number(invoice.taxRate) : 0);
  const [shipping, setShipping] = useState(invoice ? Number(invoice.shipping) : 0);
  const [status, setStatus] = useState(invoice?.status || "DRAFT");
<<<<<<< HEAD
  const [showAdjustments, setShowAdjustments] = useState(
    Boolean((invoice ? Number(invoice.discount) : 0) || (invoice ? Number(invoice.taxRate) : 0) || (invoice ? Number(invoice.shipping) : 0))
  );
  const [showTerms, setShowTerms] = useState(Boolean(invoice?.terms));
=======
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b

  const projectOptions = useMemo(() => [
    { value: "", label: "Direct Invoice (No Project)" },
    ...projects.map(p => ({ value: p.id, label: p.name }))
  ], [projects]);

  const companyOptions = useMemo(() => [
    ...companies.map(c => ({ value: c.id, label: c.name }))
  ], [companies]);

  const selectedProject = projects.find(p => p.id === projectId);
  const selectedCompany = companies.find(c => c.id === companyId);

  const installmentOptions = useMemo(() => {
    if (!selectedProject) return [];
    return [
      { value: "", label: "Select Installment..." },
      ...selectedProject.installments.map(i => ({ 
        value: i.id, 
        label: `${i.label} - $${Number(i.amount).toLocaleString()}` 
      }))
    ];
  }, [selectedProject]);

  useEffect(() => {
    if (state?.success) {
      router.push("/invoices");
    }
  }, [state, router]);

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    setInstallmentId("");
  };

  const handleInstallmentChange = (id: string) => {
    const inst = selectedProject?.installments.find(i => i.id === id);
    setInstallmentId(id);
    if (inst) {
      setItems([{ id: Math.random().toString(), description: inst.label, quantity: 1, unitPrice: Number(inst.amount) }]);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = discount; // assuming fixed amount for now, or could be %
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
  const total = subtotal - discountAmount + taxAmount + shipping;

  const wrappedFormAction = (formData: FormData) => {
    formData.append("items", JSON.stringify(items.map(({id, ...rest}) => rest)));
    formData.append("amount", total.toString());
    formData.append("discount", discount.toString());
    formData.append("taxRate", taxRate.toString());
    formData.append("shipping", shipping.toString());
    formData.append("status", status);
    formAction(formData);
  };

  return (
    <form action={wrappedFormAction} className="space-y-8">
<<<<<<< HEAD
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Basics</h2>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl border border-slate-200/60 bg-slate-50 overflow-hidden flex items-center justify-center text-teal-600">
                  {selectedCompany?.logoUrl ? (
                    <img
                      src={selectedCompany.logoUrl}
                      alt={`${selectedCompany.name} logo`}
                      className="h-full w-full object-contain bg-white"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Issuing company</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{selectedCompany?.name || "Select a company"}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Issuing Company Entity</label>
                <SearchableSelect
                  name="companyId"
                  value={companyId}
                  onChange={setCompanyId}
                  options={companyOptions}
                  placeholder="Select Issuing Company"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-00001"
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Issue Date</label>
                <input
                  type="date"
                  name="issueDate"
                  required
                  defaultValue={invoice ? new Date(invoice.issueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  required
                  defaultValue={invoice ? new Date(invoice.dueDate).toISOString().split("T")[0] : new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]}
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">Recipient Name</label>
                <input
                  type="text"
                  name="recipientName"
                  required
                  defaultValue={invoice?.recipientName || ""}
                  placeholder="Full name or company"
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">Recipient Address</label>
                <textarea
                  name="recipientAddress"
                  rows={2}
                  defaultValue={invoice?.recipientAddress || ""}
                  placeholder="Optional billing address"
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Project (Optional)</label>
                <SearchableSelect
                  name="projectId"
                  value={projectId}
                  onChange={handleProjectChange}
                  options={projectOptions}
                  placeholder="Select Project (Optional)"
                  className="mt-1"
                />
              </div>

              {selectedProject && selectedProject.installments.length > 0 ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Installment (Optional)</label>
                  <SearchableSelect
                    name="installmentId"
                    value={installmentId}
                    onChange={handleInstallmentChange}
                    options={installmentOptions}
                    placeholder="Select Installment..."
                    className="mt-1"
                    inputClassName="border-teal-200 bg-teal-50 text-teal-900 font-medium"
                  />
                  <p className="mt-1 text-[10px] text-teal-600 font-medium italic">Selecting an installment will auto-fill the first line item</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Status</label>
                  <select
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Line Items</h2>
              <button
                type="button"
                onClick={() => setShowAdjustments((v) => !v)}
                className="text-xs font-semibold text-slate-600 hover:text-teal-700 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors border border-slate-200"
              >
                {showAdjustments ? "Hide adjustments" : "Add adjustments"}
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="flex flex-wrap sm:flex-nowrap items-end gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      required
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qty</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.quantity}
                      required
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      required
                      onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="w-32 text-right px-4 py-2 bg-white rounded-lg border border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amount</label>
                    <span className="text-sm font-bold text-slate-900">${(item.quantity * item.unitPrice).toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Remove line item ${idx + 1}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 px-4 py-2 rounded-xl border-2 border-dashed border-teal-100 hover:border-teal-200 hover:bg-teal-50 transition-all w-full justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add Line Item
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {showAdjustments ? (
                <div className="space-y-4 rounded-2xl bg-slate-50 p-6 border border-slate-100">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Adjustments</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Discount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Tax Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Shipping ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={shipping}
                        onChange={(e) => setShipping(Number(e.target.value))}
                        className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div />
              )}

              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-72 p-6 rounded-3xl bg-slate-900 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full -z-0"></div>
                  <div className="relative z-10 space-y-3">
                    <div className="flex justify-between text-xs font-medium text-slate-400">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-xs font-medium text-red-400">
                        <span>Discount</span>
                        <span>-${discount.toLocaleString()}</span>
                      </div>
                    )}
                    {taxRate > 0 && (
                      <div className="flex justify-between text-xs font-medium text-slate-400">
                        <span>Tax ({taxRate}%)</span>
                        <span>${taxAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {shipping > 0 && (
                      <div className="flex justify-between text-xs font-medium text-slate-400">
                        <span>Shipping</span>
                        <span>${shipping.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-white/10 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">Total Amount</p>
                        <div className="text-3xl font-black">${total.toLocaleString()}</div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500 mb-1" aria-hidden><path d="M11 15h2"/><path d="M12 12v3"/><path d="M12 3c1.66 0 3 1.34 3 3a3 3 0 1 1-6 0c0-1.66 1.34-3 3-3Z"/><path d="M7 10v1a5 5 0 0 0 10 0v-1"/><path d="M12 21v-3"/></svg>
                    </div>
                  </div>
                </div>
              </div>
=======
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Invoice Details</h2>
            
            {/* Sequential Logo & Number */}
            <div className="flex items-start gap-6 mb-6">
               {selectedCompany?.logoUrl ? (
                  <div className="relative group">
                    <img 
                      src={selectedCompany.logoUrl} 
                      alt="Company Logo" 
                      className="h-20 w-20 object-contain rounded-xl border border-slate-100 bg-slate-50 p-2 shadow-sm transition-all group-hover:shadow-md"
                    />
                    <input type="hidden" name="companyLogoUrl" value={selectedCompany.logoUrl} />
                    <div className="absolute -top-2 -right-2 bg-teal-600 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                  </div>
               ) : (
                  <div className="h-20 w-20 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 group relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    <div className="absolute -bottom-2 -right-2 bg-slate-400 text-white p-1 rounded-full shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                    </div>
                  </div>
               )}
               <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Invoice Number</label>
                    <input 
                      type="text" 
                      name="invoiceNumber" 
                      required 
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="e.g. INV-00001" 
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 font-mono" 
                    />
                  </div>
               </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Issue Date</label>
                  <input type="date" name="issueDate" required defaultValue={invoice ? new Date(invoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Due Date</label>
                  <input type="date" name="dueDate" required defaultValue={invoice ? new Date(invoice.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]} className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Status</label>
                <select 
                  name="status" 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Recipient Information</h2>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-semibold text-slate-700">Recipient Name</label>
                  <input type="text" name="recipientName" required defaultValue={invoice?.recipientName || ""} placeholder="Full name or company" className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500" />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700">Recipient Address</label>
                  <textarea name="recipientAddress" rows={2} defaultValue={invoice?.recipientAddress || ""} placeholder="Optional billing address" className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500 resize-none" />
               </div>
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
            </div>
          </div>
        </div>

        <div className="space-y-6">
<<<<<<< HEAD
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Optional</h2>
              <button
                type="button"
                onClick={() => setShowTerms((v) => !v)}
                className="text-xs font-semibold text-slate-600 hover:text-teal-700 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors border border-slate-200"
              >
                {showTerms ? "Hide terms" : "Add terms"}
              </button>
            </div>

            {showTerms && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Terms & Conditions</label>
                  <textarea
                    name="terms"
                    rows={3}
                    defaultValue={invoice?.terms || ""}
                    placeholder="Standard terms and conditions..."
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500 resize-none font-sans text-sm"
                  />
                </div>
              </div>
            )}
          </div>
=======
           <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Linked Entity</h2>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700">Issuing Company Entity</label>
                    <SearchableSelect
                      name="companyId"
                      value={companyId}
                      onChange={setCompanyId}
                      options={companyOptions}
                      placeholder="Select Issuing Company"
                      className="mt-1"
                    />
                    {selectedCompany?.logoUrl && (
                      <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50 border border-teal-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-tight truncate">Logo Linked: {selectedCompany.logoUrl}</span>
                      </div>
                    )}
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700">Project (Optional)</label>
                    <SearchableSelect
                      name="projectId"
                      value={projectId}
                      onChange={handleProjectChange}
                      options={projectOptions}
                      placeholder="Select Project (Optional)"
                      className="mt-1"
                    />
                 </div>
                 {selectedProject && selectedProject.installments.length > 0 && (
                    <div>
                       <label className="block text-sm font-semibold text-slate-700">Installment (Optional)</label>
                       <SearchableSelect
                         name="installmentId"
                         value={installmentId}
                         onChange={handleInstallmentChange}
                         options={installmentOptions}
                         placeholder="Select Installment..."
                         className="mt-1"
                         inputClassName="border-teal-200 bg-teal-50 text-teal-900 font-medium"
                       />
                       <p className="mt-1 text-[10px] text-teal-600 font-medium italic">* Selecting an installment will auto-fill the amount below</p>
                    </div>
                 )}
              </div>
           </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
               <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Notes & Terms</h2>
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Internal Notes</label>
                    <textarea name="notes" rows={2} placeholder="Bank details or internal instructions..." className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500 resize-none font-sans text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Terms & Conditions</label>
                    <textarea name="terms" rows={3} placeholder="Standard terms and conditions..." className="mt-1 block w-full rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm focus:border-teal-500 resize-none font-sans text-sm" />
                  </div>
               </div>
            </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Line Items</h2>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="flex flex-wrap sm:flex-nowrap items-end gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                <input 
                  type="text" 
                  value={item.description} 
                  required
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)} 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div className="w-24">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qty</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={item.quantity} 
                  required
                  onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div className="w-32">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Unit Price</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={item.unitPrice} 
                  required
                  onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))} 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div className="w-32 text-right px-4 py-2 bg-white rounded-lg border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amount</label>
                <span className="text-sm font-bold text-slate-900">${(item.quantity * item.unitPrice).toLocaleString()}</span>
              </div>
              <button 
                type="button" 
                onClick={() => removeItem(item.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </button>
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={addItem}
            className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 px-4 py-2 rounded-xl border-2 border-dashed border-teal-100 hover:border-teal-200 hover:bg-teal-50 transition-all w-full justify-center"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
             Add Line Item
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4 rounded-2xl bg-slate-50 p-6 border border-slate-100">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Adjustment Details</h3>
              <div className="grid grid-cols-3 gap-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Discount ($)</label>
                    <input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Tax Rate (%)</label>
                    <input type="number" step="0.01" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Shipping ($)</label>
                    <input type="number" step="0.01" value={shipping} onChange={(e) => setShipping(Number(e.target.value))} className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                 </div>
              </div>
           </div>

           <div className="flex justify-end pt-2">
              <div className="w-full sm:w-72 p-6 rounded-3xl bg-slate-900 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full -z-0"></div>
                 <div className="relative z-10 space-y-3">
                    <div className="flex justify-between text-xs font-medium text-slate-400">
                       <span>Subtotal</span>
                       <span>${subtotal.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-xs font-medium text-red-400">
                         <span>Discount</span>
                         <span>-${discount.toLocaleString()}</span>
                      </div>
                    )}
                    {taxRate > 0 && (
                      <div className="flex justify-between text-xs font-medium text-slate-400">
                         <span>Tax ({taxRate}%)</span>
                         <span>${taxAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {shipping > 0 && (
                      <div className="flex justify-between text-xs font-medium text-slate-400">
                         <span>Shipping</span>
                         <span>${shipping.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-white/10 flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">Total Amount</p>
                          <div className="text-3xl font-black">${total.toLocaleString()}</div>
                       </div>
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500 mb-1"><path d="M11 15h2"/><path d="M12 12v3"/><path d="M12 3c1.66 0 3 1.34 3 3a3 3 0 1 1-6 0c0-1.66 1.34-3 3-3Z"/><path d="M7 10v1a5 5 0 0 0 10 0v-1"/><path d="M12 21v-3"/></svg>
                    </div>
                 </div>
              </div>
           </div>
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push("/invoices")}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}
