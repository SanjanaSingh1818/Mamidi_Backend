require("dotenv").config();
const mongoose = require("mongoose");
const Products = require("../models/Products");

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI missing in .env");
    process.exit(1);
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const result = await Products.updateMany({}, { Type: "Calendar" });
    console.log(
      `Updated ${result.modifiedCount ?? result.nModified} products to Type="Calendar".`
    );
  } catch (err) {
    console.error("Update failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
