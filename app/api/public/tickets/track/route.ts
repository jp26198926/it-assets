import { NextRequest, NextResponse } from "next/server";
import * as ticketService from "@/lib/services/ticket-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketNo = searchParams.get("ticket_no");
    const email = searchParams.get("email");

    if (!ticketNo || !email) {
      return NextResponse.json(
        { success: false, error: "ticket_no and email are required" },
        { status: 400 }
      );
    }

    const ticket = await ticketService.getPublicTicketByNoAndEmail(ticketNo, email);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found. Please check your ticket number and email." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to track ticket" },
      { status: 500 }
    );
  }
}
