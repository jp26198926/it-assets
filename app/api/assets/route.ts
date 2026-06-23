import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as assetService from "@/lib/services/asset-service";
import type { AssetFilters } from "@/lib/types/asset";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/assets", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: AssetFilters = {};
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("barcode")) filters.barcode = searchParams.get("barcode")!;
    if (searchParams.get("serial_number")) filters.serial_number = searchParams.get("serial_number")!;
    if (searchParams.get("item_id")) filters.item_id = searchParams.get("item_id")!;
    if (searchParams.get("location_id")) filters.location_id = searchParams.get("location_id")!;
    if (searchParams.get("assigned_to_employee")) filters.assigned_to_employee = searchParams.get("assigned_to_employee")!;
    if (searchParams.get("assigned_to_department")) filters.assigned_to_department = searchParams.get("assigned_to_department")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const assets = await assetService.getAssets(hasFilters ? filters : undefined);
    return apiSuccess(assets);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch assets");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/assets", "Add");
    if (error) return error;

    const body = await request.json();

    const asset = await assetService.createAsset({
      item_id: body.item_id,
      barcode: body.barcode,
      serial_number: body.serial_number,
      remarks: body.remarks,
      date_received: body.date_received,
      purchase_date: body.purchase_date,
      purchase_price: body.purchase_price,
      warranty_expiry: body.warranty_expiry,
      location_id: body.location_id,
      assigned_to_employee: body.assigned_to_employee,
      assigned_to_department: body.assigned_to_department,
      status: body.status,
    });
    return apiSuccess(asset, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create asset");
  }
}
