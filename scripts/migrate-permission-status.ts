import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set");
  process.exit(1);
}

interface PermissionStatusDoc {
  _id: mongoose.Types.ObjectId;
  status: string;
}

interface PermissionDoc {
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

  const permissionStatusesCol = db.collection<PermissionStatusDoc>("permission_statuses");
  const permissionsCol = db.collection<PermissionDoc>("permissions");

  try {
    const statusDocs = await permissionStatusesCol.find().toArray();

    if (statusDocs.length === 0) {
      console.log("No permission_statuses found. Skipping migration.");
      return;
    }

    const statusMap = new Map<string, mongoose.Types.ObjectId>();
    for (const doc of statusDocs) {
      statusMap.set(doc.status, doc._id);
    }

    const activeStatusId = statusMap.get("Active");
    const deletedStatusId = statusMap.get("Deleted");

    if (!activeStatusId) {
      console.error("Active status not found in permission_statuses");
      process.exit(1);
    }

    const activeResult = await permissionsCol.updateMany(
      { status_id: activeStatusId },
      { $set: { status: "Active" }, $unset: { status_id: "" } }
    );
    console.log(`Migrated ${activeResult.modifiedCount} permissions to Active status`);

    if (deletedStatusId) {
      const deletedResult = await permissionsCol.updateMany(
        { status_id: deletedStatusId },
        { $set: { status: "Deleted" }, $unset: { status_id: "" } }
      );
      console.log(`Migrated ${deletedResult.modifiedCount} permissions to Deleted status`);
    }

    const unknownResult = await permissionsCol.updateMany(
      { status_id: { $exists: true } },
      { $set: { status: "Active" }, $unset: { status_id: "" } }
    );
    if (unknownResult.modifiedCount > 0) {
      console.log(`Migrated ${unknownResult.modifiedCount} permissions with unknown status to Active`);
    }

    console.log("Dropping permission_statuses collection...");
    await permissionStatusesCol.drop();
    console.log("permission_statuses collection dropped");

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await conn.disconnect();
  }
}

migrate();
