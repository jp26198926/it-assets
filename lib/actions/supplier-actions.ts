"use server";

import * as supplierService from "@/lib/services/supplier-service";
import type { CreateSupplierInput, UpdateSupplierInput, SupplierFilters, Supplier } from "@/lib/types/supplier";

export async function getSuppliers(filters?: SupplierFilters): Promise<Supplier[]> {
  return supplierService.getSuppliers(filters);
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  return supplierService.getSupplierById(id);
}

export async function createSupplier(data: CreateSupplierInput): Promise<Supplier> {
  return supplierService.createSupplier(data);
}

export async function updateSupplier(id: string, data: UpdateSupplierInput): Promise<Supplier> {
  return supplierService.updateSupplier(id, data);
}

export async function deleteSupplier(id: string, reason?: string): Promise<void> {
  return supplierService.deleteSupplier(id, reason);
}

export async function restoreSupplier(id: string): Promise<void> {
  return supplierService.restoreSupplier(id);
}
