"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
<<<<<<< HEAD
import { getOrganization } from "@/lib/organization-context";
import type { Prisma } from "@prisma/client";
import { computeInvoiceGrandTotal } from "./invoice-math";

type InvoiceStatus = "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE";

function formatReceiptNumber(n: number): string {
  return n < 10000 ? n.toString().padStart(4, "0") : n.toString();
}

async function reconcileInvoicePaymentStatusTx(tx: Prisma.TransactionClient, invoiceId: string) {
  const invoice = await tx.invoice.findFirst({
    where: { id: invoiceId, deletedAt: null },
    include: { items: true, payments: true },
  });
  if (!invoice) return;

  const grandTotal = computeInvoiceGrandTotal(invoice);
  const paidTotal = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);

  const previous = invoice.status as InvoiceStatus;
  let status: InvoiceStatus = previous;
  let paidAt: Date | null = invoice.paidAt;

  if (paidTotal <= 0) {
    if (previous === "PAID" || previous === "PARTIAL") {
      status = "SENT";
    }
    paidAt = null;
  } else if (grandTotal > 0 && paidTotal + 1e-6 >= grandTotal) {
    status = "PAID";
    const latestMs = invoice.payments.reduce(
      (max, p) => Math.max(max, new Date(p.paidAt).getTime()),
      0
    );
    paidAt = latestMs ? new Date(latestMs) : new Date();
  } else {
    status = "PARTIAL";
    paidAt = null;
  }

  await tx.invoice.update({
    where: { id: invoiceId },
    data: { status, paidAt },
  });
}

export async function getLatestInvoiceNumber(): Promise<string> {
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: { startsWith: "INV-" },
    },
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
=======
import { getTenantForRequest } from "@/lib/tenant-context";
// import { InvoiceStatus } from "@prisma/client";
type InvoiceStatus = "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE";

export async function getLatestInvoiceNumber(): Promise<string> {
  const tenant = await getTenantForRequest();
  
  const lastInvoice = await prisma.invoice.findFirst({
    where: { 
      tenantId: tenant.id,
      invoiceNumber: { startsWith: "INV-" }
    },
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true }
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  });

  if (!lastInvoice?.invoiceNumber) {
    return "INV-00001";
  }

<<<<<<< HEAD
=======
  // Extract number from INV-XXXXX
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  const matches = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
  if (!matches) {
    return "INV-00001";
  }

<<<<<<< HEAD
  const lastNum = parseInt(matches[1], 10);
  const nextNum = lastNum + 1;

  const paddedNum = nextNum.toString().padStart(5, "0");
=======
  const lastNum = parseInt(matches[1]);
  const nextNum = lastNum + 1;

  // Format with at least 5 digits, but allow more
  const paddedNum = nextNum.toString().padStart(5, '0');
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  return `INV-${paddedNum}`;
}

export async function createInvoice(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
<<<<<<< HEAD
=======
  const tenant = await getTenantForRequest();
  
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  try {
    const projectId = (formData.get("projectId") as string)?.trim();
    const companyId = (formData.get("companyId") as string)?.trim();
    const installmentId = (formData.get("installmentId") as string)?.trim();
    const invoiceNumber = (formData.get("invoiceNumber") as string)?.trim();
    const issueDateRaw = formData.get("issueDate") as string;
    const dueDateRaw = formData.get("dueDate") as string;
    const recipientName = (formData.get("recipientName") as string)?.trim();
    const recipientAddress = (formData.get("recipientAddress") as string)?.trim();
<<<<<<< HEAD
=======
    const notes = (formData.get("notes") as string)?.trim();
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
    const terms = (formData.get("terms") as string)?.trim();
    const status = (formData.get("status") as InvoiceStatus) || "DRAFT";

    const discount = Number(formData.get("discount")) || 0;
    const taxRate = Number(formData.get("taxRate")) || 0;
    const shipping = Number(formData.get("shipping")) || 0;

    if (!invoiceNumber) return { error: "Invoice number is required" };
    if (!issueDateRaw) return { error: "Issue date is required" };
    if (!dueDateRaw) return { error: "Due date is required" };
    if (!recipientName) return { error: "Recipient name is required" };

    const issueDate = new Date(issueDateRaw);
    const dueDate = new Date(dueDateRaw);

<<<<<<< HEAD
    const itemsJson = formData.get("items") as string;
    const items = JSON.parse(itemsJson || "[]") as {
      description: string;
      quantity: number;
      unitPrice: number;
    }[];

    if (items.length === 0) return { error: "Add at least one line item" };

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    await prisma.$transaction(async (tx) => {
=======
    // Handle items (JSON)
    const itemsJson = formData.get("items") as string;
    const items = JSON.parse(itemsJson || "[]") as { description: string, quantity: number, unitPrice: number }[];

    if (items.length === 0) return { error: "Add at least one line item" };

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    await prisma.$transaction(async (tx: any) => {
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
      await tx.invoice.create({
        data: {
          invoiceNumber,
          projectId: projectId || undefined,
          companyId: companyId || undefined,
          installmentId: installmentId || undefined,
          amount: totalAmount,
          discount,
          taxRate,
          shipping,
          terms,
          status,
          issueDate,
          dueDate,
          recipientName,
          recipientAddress,
<<<<<<< HEAD
          items: {
            create: items.map((item) => ({
=======
          notes,
          tenantId: tenant.id,
          items: {
            create: items.map(item => ({
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.quantity * item.unitPrice,
<<<<<<< HEAD
            })),
          },
        },
=======
            }))
          }
        }
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
      });
    });

    revalidatePath("/invoices");
    return { success: true };
<<<<<<< HEAD
  } catch (e: unknown) {
    console.error("Failed to create invoice:", e);
    const message = e instanceof Error ? e.message : "Failed to create invoice";
    return { error: message };
=======
  } catch (e: any) {
    console.error("Failed to create invoice:", e);
    return { error: e.message || "Failed to create invoice" };
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  }
}

export async function updateInvoice(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
<<<<<<< HEAD
=======
  const tenant = await getTenantForRequest();
  
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  try {
    const projectId = (formData.get("projectId") as string)?.trim();
    const companyId = (formData.get("companyId") as string)?.trim();
    const installmentId = (formData.get("installmentId") as string)?.trim();
    const invoiceNumber = (formData.get("invoiceNumber") as string)?.trim();
    const issueDateRaw = formData.get("issueDate") as string;
    const dueDateRaw = formData.get("dueDate") as string;
    const recipientName = (formData.get("recipientName") as string)?.trim();
    const recipientAddress = (formData.get("recipientAddress") as string)?.trim();
<<<<<<< HEAD
    const terms = (formData.get("terms") as string)?.trim();
    const status = formData.get("status") as InvoiceStatus;
=======
    const notes = (formData.get("notes") as string)?.trim();
    const terms = (formData.get("terms") as string)?.trim();
    const status = (formData.get("status") as InvoiceStatus);
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b

    const discount = Number(formData.get("discount")) || 0;
    const taxRate = Number(formData.get("taxRate")) || 0;
    const shipping = Number(formData.get("shipping")) || 0;

    if (!invoiceNumber) return { error: "Invoice number is required" };
    if (!issueDateRaw) return { error: "Issue date is required" };
    if (!dueDateRaw) return { error: "Due date is required" };
    if (!recipientName) return { error: "Recipient name is required" };

    const issueDate = new Date(issueDateRaw);
    const dueDate = new Date(dueDateRaw);

    const itemsJson = formData.get("items") as string;
<<<<<<< HEAD
    const items = JSON.parse(itemsJson || "[]") as {
      id?: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }[];

    if (items.length === 0) return { error: "Add at least one line item" };

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
      0
    );

    await prisma.$transaction(async (tx) => {
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      await tx.invoice.update({
        where: { id },
=======
    const items = JSON.parse(itemsJson || "[]") as { id?: string, description: string, quantity: number, unitPrice: number }[];

    if (items.length === 0) return { error: "Add at least one line item" };

    const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);

    await prisma.$transaction(async (tx: any) => {
      // Delete old items and create new ones for simplicity in the update action
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });

      await tx.invoice.update({
        where: { id, tenantId: tenant.id },
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
        data: {
          invoiceNumber,
          projectId: projectId || null,
          companyId: companyId || null,
          installmentId: installmentId || null,
          amount: totalAmount,
          discount,
          taxRate,
          shipping,
          terms,
          status,
          issueDate,
          dueDate,
          recipientName,
          recipientAddress,
<<<<<<< HEAD
          items: {
            create: items.map((item) => ({
=======
          notes,
          items: {
            create: items.map(item => ({
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: Number(item.quantity) * Number(item.unitPrice),
<<<<<<< HEAD
            })),
          },
        },
      });

      await reconcileInvoicePaymentStatusTx(tx, id);
=======
            }))
          }
        }
      });
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
    });

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${id}`);
    return { success: true };
<<<<<<< HEAD
  } catch (e: unknown) {
    console.error("Failed to update invoice:", e);
    const message = e instanceof Error ? e.message : "Failed to update invoice";
    return { error: message };
=======
  } catch (e: any) {
    console.error("Failed to update invoice:", e);
    return { error: e.message || "Failed to update invoice" };
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
<<<<<<< HEAD
  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });
    await reconcileInvoicePaymentStatusTx(tx, id);
  });

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.update({
    where: { id },
    data: { deletedAt: new Date() },
=======
  const tenant = await getTenantForRequest();
  
  await prisma.invoice.update({
    where: { id, tenantId: tenant.id },
    data: { 
      status,
      paidAt: status === "PAID" ? new Date() : null,
    }
  });

  revalidatePath("/invoices");
}

export async function deleteInvoice(id: string) {
  const tenant = await getTenantForRequest();

  await prisma.invoice.update({
    where: { id, tenantId: tenant.id },
    data: { deletedAt: new Date() }
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
  });

  revalidatePath("/invoices");
}
<<<<<<< HEAD

export async function createInvoicePaymentAction(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const org = await getOrganization();
  const invoiceId = (formData.get("invoiceId") as string)?.trim();
  const amountRaw = formData.get("amount") as string;
  const paidAtRaw = (formData.get("paidAt") as string)?.trim();
  const paymentMethod = (formData.get("paymentMethod") as string)?.trim() || null;
  const reference = (formData.get("reference") as string)?.trim() || null;
  const accountNo = (formData.get("accountNo") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!invoiceId) return { error: "Invoice required" };
  const amount = amountRaw ? parseFloat(amountRaw) : 0;
  if (Number.isNaN(amount) || amount <= 0) return { error: "Valid amount required" };

  try {
    await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, deletedAt: null },
        include: { items: true, payments: true },
      });
      if (!invoice) throw new Error("Invoice not found");
      if (invoice.status === "DRAFT") {
        throw new Error("Send the invoice before recording payments");
      }

      const grandTotal = computeInvoiceGrandTotal(invoice);
      const paidBefore = invoice.payments.reduce((s, p) => s + Number(p.amount), 0);
      const remaining = Math.max(0, grandTotal - paidBefore);
      if (amount > remaining + 0.01) {
        throw new Error(`Amount exceeds balance due ($${remaining.toFixed(2)})`);
      }

      const t = await tx.organization.update({
        where: { id: org.id },
        data: { lastReceiptNumber: { increment: 1 } },
        select: { lastReceiptNumber: true },
      });
      const receiptNumber = formatReceiptNumber(t.lastReceiptNumber);
      const paidAt = paidAtRaw ? new Date(paidAtRaw) : new Date();

      await tx.invoicePayment.create({
        data: {
          invoiceId,
          amount,
          paidAt,
          receiptNumber,
          paymentMethod,
          reference,
          accountNo,
          notes,
        },
      });

      await reconcileInvoicePaymentStatusTx(tx, invoiceId);
    });

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceId}`);
    return { success: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to record payment";
    return { error: message };
  }
}

export async function deleteInvoicePaymentAction(formData: FormData): Promise<void> {
  const invoiceId = (formData.get("invoiceId") as string)?.trim();
  const paymentId = (formData.get("paymentId") as string)?.trim();
  if (!invoiceId || !paymentId) return;

  await prisma.$transaction(async (tx) => {
    await tx.invoicePayment.deleteMany({
      where: { id: paymentId, invoiceId },
    });
    await reconcileInvoicePaymentStatusTx(tx, invoiceId);
  });

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
}
=======
>>>>>>> 5ab41dbb587e635dbb5869b0a920fb9e9fdf604b
