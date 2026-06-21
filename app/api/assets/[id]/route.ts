import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as assetService from "@/lib/services/asset-service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/assets", "Access");
    if (error) return error;

    const { id } = await params;
    const asset = await assetService.getAssetById(id);
    if (!asset) return apiError("Asset not found", 404);
    return apiSuccess(asset);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch asset");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/assets", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const asset = await assetService.updateAsset(id, {
      item_id: body.item_id,
      barcode: body.barcode,
      serial_number: body.serial_number,
      purchase_date: body.purchase_date,
      purchase_price: body.purchase_price,
      warranty_expiry: body.warranty_expiry,
      location_id: body.location_id,
      assigned_to_employee: body.assigned_to_employee,
      assigned_to_department: body.assigned_to_department,
      status: body.status,
    });
    return apiSuccess(asset);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update asset");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await withPageAuth("/assets", "Delete");
    if (error) return error;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    await assetService.deleteAsset(id, body.reason);
    return apiSuccess({ message: "Asset deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete asset");
  }
}
