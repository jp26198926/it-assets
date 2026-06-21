import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set");
  process.exit(1);
}

interface PageStatusDoc {
  _id: mongoose.Types.ObjectId;
  status: string;
}

interface PageDoc {
  _id: mongoose.Types.ObjectId;
  status_id?: mongoose.Types.ObjectId;
  status?: string;
}

async function migrate() {
  console.log("Connecting to database...");
  const conn = await mongoose.connect(MONGODB_URI!);
  const db = conn.connection.db;

  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  const pageStatusesCol = db.collection<PageStatusDoc>("page_statuses");
  const pagesCol = db.collection<PageDoc>("pages");

  try {
    const statusDocs = await pageStatusesCol.find().toArray();

    if (statusDocs.length === 0) {
      console.log("No page_statuses found. Skipping migration.");
      return;
    }

    const statusMap = new Map<string, mongoose.Types.ObjectId>();
    for (const doc of statusDocs) {
      statusMap.set(doc.status, doc._id);
    }

    const activeStatusId = statusMap.get("Active");
    const deletedStatusId = statusMap.get("Deleted");

    if (!activeStatusId) {
      console.error("Active status not found in page_statuses");
      process.exit(1);
    }

    const activeResult = await pagesCol.updateMany(
      { status_id: activeStatusId },
      { $set: { status: "Active" }, $unset: { status_id: "" } }
    );
    console.log(`Migrated ${activeResult.modifiedCount} pages to Active status`);

    if (deletedStatusId) {
      const deletedResult = await pagesCol.updateMany(
        { status_id: deletedStatusId },
        { $set: { status: "Deleted" }, $unset: { status_id: "" } }
      );
      console.log(`Migrated ${deletedResult.modifiedCount} pages to Deleted status`);
    }

    const unknownResult = await pagesCol.updateMany(
      { status_id: { $exists: true } },
      { $set: { status: "Active" }, $unset: { status_id: "" } }
    );
    if (unknownResult.modifiedCount > 0) {
      console.log(`Migrated ${unknownResult.modifiedCount} pages with unknown status to Active`);
    }

    console.log("Dropping page_statuses collection...");
    await pageStatusesCol.drop();
    console.log("page_statuses collection dropped");

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await conn.disconnect();
  }
}

migrate();
