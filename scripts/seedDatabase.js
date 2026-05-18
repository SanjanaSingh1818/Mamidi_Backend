require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Products");

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI missing in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Create categories
    const categories = [
      { name: "Calendars", slug: "calendars" },
      { name: "Keepsakes", slug: "keepsakes" },
      { name: "Custom Products", slug: "custom-products" },
      { name: "Embroidery", slug: "embroidery" },
      { name: "Pouches", slug: "pouches" },
      { name: "Bags", slug: "bags" },
    ];

    console.log("\n📂 Creating categories...");
    for (const cat of categories) {
      const existing = await Category.findOne({
        $or: [{ name: cat.name }, { slug: cat.slug }],
      });
      if (!existing) {
        await Category.create(cat);
        console.log(`  ✅ Created category: ${cat.name}`);
      } else {
        console.log(`  ℹ️  Category already exists: ${cat.name}`);
      }
    }

    // Sample products for calendars
    console.log("\n📅 Creating sample Calendar products...");
    const calendarProducts = [
      {
        title: "Illustrated 2026 Calendar - Nature",
        Type: "Calendars",
        category: "Calendars",
        description:
          "Beautiful illustrated calendar featuring nature-inspired artwork for each month. Perfect for storytellers and nature lovers.",
        price: "299",
        Occasion: "New Year Gift",
        Material: "Premium Art Paper",
        Colour: "Multicolor",
        Dimensions: "8\" x 10\"",
        Pages: "12",
        Print: "Full Color",
        main: [],
      },
      {
        title: "Illustrated 2026 Calendar - Stories",
        Type: "Calendars",
        category: "Calendars",
        description:
          "A year told in art. Each month features illustrations that celebrate moments and stories from your everyday life.",
        price: "299",
        Occasion: "New Year Gift",
        Material: "Premium Art Paper",
        Colour: "Multicolor",
        Dimensions: "8\" x 10\"",
        Pages: "12",
        Print: "Full Color",
        main: [],
      },
      {
        title: "Handcrafted Wall Calendar",
        Type: "Calendars",
        category: "Calendars",
        description:
          "Handcrafted calendar designed to bring structure, calm, and creativity into your everyday moments.",
        price: "349",
        Occasion: "Home Decor",
        Material: "Canvas & Art Paper",
        Colour: "Natural",
        Dimensions: "10\" x 12\"",
        Pages: "12",
        Print: "Mixed Media",
        main: [],
      },
    ];

    for (const product of calendarProducts) {
      const existing = await Product.findOne({ title: product.title });
      if (!existing) {
        await Product.create(product);
        console.log(`  ✅ Created: ${product.title}`);
      } else {
        console.log(`  ℹ️  Product already exists: ${product.title}`);
      }
    }

    // Sample products for keepsakes
    console.log("\n🎁 Creating sample Keepsakes products...");
    const keepsakeProducts = [
      {
        title: "Personalized Memory Book",
        Type: "Keepsakes",
        category: "Keepsakes",
        description:
          "Custom keepsakes crafted from your stories. Preserve your precious moments in a beautifully illustrated memory book.",
        price: "599",
        Occasion: "Special Occasions",
        Material: "Hardcover Paper",
        Colour: "Multiple Options",
        Dimensions: "6\" x 8\"",
        Pages: "40",
        Print: "Full Color Custom Print",
        main: [],
      },
      {
        title: "Story Box - Illustrated Keepsake",
        Type: "Keepsakes",
        category: "Keepsakes",
        description:
          "Playful keepsakes that turn everyday moments into cherished memories. Made from your personal stories.",
        price: "449",
        Occasion: "Gift",
        Material: "Eco-Friendly Box",
        Colour: "Customizable",
        Dimensions: "8\" x 8\" x 4\"",
        Pages: "Varies",
        Print: "Custom Print",
        main: [],
      },
      {
        title: "Crafted Journal with Illustrations",
        Type: "Keepsakes",
        category: "Keepsakes",
        description:
          "Handcrafted journal with custom illustrations. A perfect keepsake to hold your stories and preserve memories.",
        price: "399",
        Occasion: "Personal Use",
        Material: "Premium Notebook",
        Colour: "Multicolor",
        Dimensions: "5\" x 7\"",
        Pages: "100",
        Print: "Custom Cover",
        main: [],
      },
    ];

    for (const product of keepsakeProducts) {
      const existing = await Product.findOne({ title: product.title });
      if (!existing) {
        await Product.create(product);
        console.log(`  ✅ Created: ${product.title}`);
      } else {
        console.log(`  ℹ️  Product already exists: ${product.title}`);
      }
    }

    // Sample custom products
    console.log("\n🎨 Creating sample Custom Products...");
    const customProducts = [
      {
        title: "Custom Story Illustration",
        Type: "Custom Products",
        category: "Custom Products",
        description:
          "The title will be printed on the cover page and on every single page as per requirement. Create something truly yours with custom-made products crafted around your story.",
        price: "799",
        Occasion: "Custom Order",
        Material: "Premium Paper & Print",
        Colour: "Customizable",
        Dimensions: "Custom Size",
        Pages: "Custom Pages",
        Print: "Full Color Custom",
        main: [],
      },
      {
        title: "Personalized Gift Collection",
        Type: "Custom Products",
        category: "Custom Products",
        description:
          "Build your own keepsake collection. Mix and match illustrations, texts, and formats to create the perfect personalized gift.",
        priceLabel: "Made to order",
        Occasion: "Special Gifts",
        Material: "Mixed Media",
        Colour: "Customizable",
        Dimensions: "Custom",
        Pages: "Custom",
        Print: "Custom Print",
        main: [],
      },
    ];

    for (const product of customProducts) {
      const existing = await Product.findOne({ title: product.title });
      if (!existing) {
        await Product.create(product);
        console.log(`  ✅ Created: ${product.title}`);
      } else {
        console.log(`  ℹ️  Product already exists: ${product.title}`);
      }
    }

    console.log("\n✨ Database seeding completed!");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

run();
