import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set");
  process.exit(1);
}

interface ItemDoc {
  _id: mongoose.Types.ObjectId;
  item_code?: string;
  created_at?: Date;
}

async function migrate() {
  console.log("Connecting to database...");
  const conn = await mongoose.connect(MONGODB_URI!);
  const db = conn.connection.db;

  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  const itemsCol = db.collection<ItemDoc>("items");

  try {
    const itemsWithoutCode = await itemsCol
      .find({ item_code: { $exists: false } })
      .sort({ created_at: 1 })
      .toArray();

    if (itemsWithoutCode.length === 0) {
      console.log("No items without item_code found. Skipping migration.");
      return;
    }

    console.log(`Found ${itemsWithoutCode.length} items without item_code`);

    let counter = 1;
    for (const item of itemsWithoutCode) {
      const itemCode = `P${String(counter).padStart(6, "0")}`;
      await itemsCol.updateOne(
        { _id: item._id },
        { $set: { item_code: itemCode } }
      );
      console.log(`  ${item._id} -> ${itemCode}`);
      counter++;
    }

    console.log(`Migration completed. Assigned ${itemsWithoutCode.length} item codes.`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await conn.disconnect();
  }
}

migrate();
