import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as supplierService from "@/lib/services/supplier-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/suppliers", "Access");
    if (error) return error;

    const { id } = await params;
    const supplier = await supplierService.getSupplierById(id);
    if (!supplier) return apiError("Supplier not found", 404);
    return apiSuccess(supplier);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch supplier");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/suppliers", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const supplier = await supplierService.updateSupplier(id, {
      name: body.name,
      contact_person: body.contact_person,
      phone: body.phone,
      email: body.email,
      address: body.address,
    });
    return apiSuccess(supplier);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update supplier");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/suppliers", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;

    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Body may be empty for DELETE
    }

    await supplierService.deleteSupplier(id, reason);
    return apiSuccess({ message: "Supplier deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete supplier");
  }
}
