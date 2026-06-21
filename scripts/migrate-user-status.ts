import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set");
  process.exit(1);
}

interface UserStatusDoc {
  _id: mongoose.Types.ObjectId;
  status: string;
}

interface UserDoc {
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

  const userStatusesCol = db.collection<UserStatusDoc>("user_statuses");
  const usersCol = db.collection<UserDoc>("users");

  try {
    const statusDocs = await userStatusesCol.find().toArray();

    if (statusDocs.length === 0) {
      console.log("No user_statuses found. Skipping migration.");
      return;
    }

    const statusMap = new Map<string, mongoose.Types.ObjectId>();
    for (const doc of statusDocs) {
      statusMap.set(doc.status, doc._id);
    }

    const activeStatusId = statusMap.get("Active");
    const deletedStatusId = statusMap.get("Deleted");
    const inactiveStatusId = statusMap.get("Inactive");

    if (!activeStatusId) {
      console.error("Active status not found in user_statuses");
      process.exit(1);
    }

    const activeResult = await usersCol.updateMany(
      { status_id: activeStatusId },
      { $set: { status: "Active" }, $unset: { status_id: "" } }
    );
    console.log(`Migrated ${activeResult.modifiedCount} users to Active status`);

    if (deletedStatusId) {
      const deletedResult = await usersCol.updateMany(
        { status_id: deletedStatusId },
        { $set: { status: "Deleted" }, $unset: { status_id: "" } }
      );
      console.log(`Migrated ${deletedResult.modifiedCount} users to Deleted status`);
    }

    if (inactiveStatusId) {
      const inactiveResult = await usersCol.updateMany(
        { status_id: inactiveStatusId },
        { $set: { status: "Inactive" }, $unset: { status_id: "" } }
      );
      console.log(`Migrated ${inactiveResult.modifiedCount} users to Inactive status`);
    }

    const unknownResult = await usersCol.updateMany(
      { status_id: { $exists: true } },
      { $set: { status: "Active" }, $unset: { status_id: "" } }
    );
    if (unknownResult.modifiedCount > 0) {
      console.log(`Migrated ${unknownResult.modifiedCount} users with unknown status to Active`);
    }

    console.log("Dropping user_statuses collection...");
    await userStatusesCol.drop();
    console.log("user_statuses collection dropped");

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await conn.disconnect();
  }
}

migrate();
