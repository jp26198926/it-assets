import { connectDB, disconnectDB } from "../lib/db/connection";
import { Page } from "../lib/db/models/page";

async function seedTicketReportPage() {
  await connectDB();

  const existing = await Page.findOne({ path: "/ticket-report" });
  if (existing) {
    console.log('Page "/ticket-report" already exists. Skipping.');
    await disconnectDB();
    return;
  }

  const maxOrder = await Page.findOne({ parent_id: null }).sort({ order: -1 }).lean();
  const nextOrder = maxOrder ? ((maxOrder as unknown as { order: number }).order || 0) + 1 : 15;

  await Page.create({
    name: "Ticket Reports",
    description: "Ticket reporting and analytics",
    path: "/ticket-report",
    icon: "BarChart3",
    parent_id: null,
    section: "Reports",
    order: nextOrder,
    status: "Active",
    created_at: new Date(),
  });

  console.log(`✓ Page "Ticket Reports" created at /ticket-report (order: ${nextOrder})`);
  await disconnectDB();
}

seedTicketReportPage().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
