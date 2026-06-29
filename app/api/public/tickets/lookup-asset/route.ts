import { NextRequest, NextResponse } from "next/server";
import * as ticketService from "@/lib/services/ticket-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get("barcode");

    if (!barcode) {
      return NextResponse.json(
        { success: false, error: "barcode is required" },
        { status: 400 }
      );
    }

    const asset = await ticketService.lookupAssetByBarcode(barcode);
    if (!asset) {
      return NextResponse.json(
        { success: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to lookup asset" },
      { status: 500 }
    );
  }
}
