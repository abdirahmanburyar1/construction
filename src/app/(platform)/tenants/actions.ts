"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TenantStatus, Role } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

export async function createTenant(formData: FormData) {
  const name = formData.get("name") as string;
  const subdomain = formData.get("subdomain") as string;
  const status = formData.get("status") as TenantStatus;
  const planId = (formData.get("planId") as string) || null;
  const hasMultipleCompanies = formData.get("hasMultipleCompanies") === "on";
  const maxCompanies = parseInt(formData.get("maxCompanies") as string) || 1;
  const adminEmail = formData.get("adminEmail") as string;
  const adminPassword = formData.get("adminPassword") as string;

  if (!name || !subdomain) {
    throw new Error("Name and subdomain are required");
  }

  if (!adminEmail || !adminPassword) {
    throw new Error("Admin email and password are required");
  }

  // Resolve planId if missing
  let resolvedPlanId = planId;
  if (!resolvedPlanId) {
    const basicPlan = await prisma.plan.findFirst({
      where: { slug: "basic" },
      select: { id: true }
    });
    if (!basicPlan) {
      throw new Error("Default basic plan not found. Please create one first.");
    }
    resolvedPlanId = basicPlan.id;
  }

  const hashedPassword = await hashPassword(adminPassword);

  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          subdomain: subdomain.toLowerCase(),
          status: status || "TRIAL",
          planId: resolvedPlanId,
          hasMultipleCompanies,
          maxCompanies,
        },
      });

      // Create Admin User
      await tx.user.create({
        data: {
          name: "Admin",
          email: adminEmail,
          password: hashedPassword,
          role: Role.COMPANY_ADMIN,
          tenantId: tenant.id,
        },
      });

      // Create Initial Company
      await tx.company.create({
        data: {
          name: tenant.name,
          tenantId: tenant.id,
          isDefault: true,
        },
      });
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      throw new Error("Subdomain or email already exists");
    }
    throw new Error("Failed to create tenant");
  }

  redirect("/tenants");
}

export async function updateTenant(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const status = formData.get("status") as TenantStatus;
  const planId = formData.get("planId") as string;
  const hasMultipleCompanies = formData.get("hasMultipleCompanies") === "on";
  
  // Get all features to handle overrides
  const features = await prisma.feature.findMany();
  
  try {
    await prisma.$transaction(async (tx) => {
      // Update basic info
      await tx.tenant.update({
        where: { id },
        data: {
          name,
          status,
          planId: planId || undefined,
          hasMultipleCompanies,
          maxCompanies: parseInt(formData.get("maxCompanies") as string) || undefined,
        },
      });

      // Handle feature overrides
      for (const feature of features) {
        const enabled = formData.get(`feature_${feature.key}`) === "on";
        
        await tx.tenantFeatureOverride.upsert({
          where: {
            tenantId_featureId: {
              tenantId: id,
              featureId: feature.id,
            },
          },
          update: { enabled },
          create: {
            tenantId: id,
            featureId: feature.id,
            enabled,
          },
        });
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update tenant");
  }

  redirect("/tenants");
}
