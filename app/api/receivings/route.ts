import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as receivingService from "@/lib/services/receiving-service";
import type { ReceivingFilters } from "@/lib/types/receiving";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/receivings", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: ReceivingFilters = {};
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("code")) filters.code = searchParams.get("code")!;
    if (searchParams.get("supplier_id")) filters.supplier_id = searchParams.get("supplier_id")!;
    if (searchParams.get("po_number")) filters.po_number = searchParams.get("po_number")!;
    if (searchParams.get("invoice_number")) filters.invoice_number = searchParams.get("invoice_number")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;
    if (searchParams.get("date_from")) filters.date_from = searchParams.get("date_from")!;
    if (searchParams.get("date_to")) filters.date_to = searchParams.get("date_to")!;

    const hasFilters = Object.keys(filters).length > 0;
    const receivings = await receivingService.getReceivings(hasFilters ? filters : undefined);
    return apiSuccess(receivings);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch receivings");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/receivings", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.date_received) {
      return apiError("date_received is required", 400);
    }

    const receiving = await receivingService.createReceiving({
      date_received: new Date(body.date_received),
      supplier_id: body.supplier_id,
      po_number: body.po_number,
      invoice_number: body.invoice_number,
      remarks: body.remarks,
    });
    return apiSuccess(receiving, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create receiving");
  }
}
