import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as supplierService from "@/lib/services/supplier-service";
import type { SupplierFilters } from "@/lib/types/supplier";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/suppliers", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: SupplierFilters = {};
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("contact_person")) filters.contact_person = searchParams.get("contact_person")!;
    if (searchParams.get("phone")) filters.phone = searchParams.get("phone")!;
    if (searchParams.get("email")) filters.email = searchParams.get("email")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const suppliers = await supplierService.getSuppliers(hasFilters ? filters : undefined);
    return apiSuccess(suppliers);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch suppliers");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/suppliers", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }

    const supplier = await supplierService.createSupplier({
      name: body.name,
      contact_person: body.contact_person,
      phone: body.phone,
      email: body.email,
      address: body.address,
    });
    return apiSuccess(supplier, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create supplier");
  }
}
