import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { TicketCategory as TicketCategoryModel } from "@/lib/db/models/ticket-category";
import { Department as DepartmentModel } from "@/lib/db/models/department";

export async function GET() {
  try {
    await connectDB();
    const [categories, departments] = await Promise.all([
      TicketCategoryModel.find({ deleted_at: null, status: "Active" })
        .select("name")
        .sort({ name: 1 })
        .lean(),
      DepartmentModel.find({ deleted_at: null, status: "Active" })
        .select("name")
        .sort({ name: 1 })
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map((c) => ({
          id: (c._id as { toString(): string }).toString(),
          name: c.name,
        })),
        departments: departments.map((d) => ({
          id: (d._id as { toString(): string }).toString(),
          name: d.name,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch options" },
      { status: 500 }
    );
  }
}
