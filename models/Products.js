const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  main: String,
  sideimg1: String,
  sideimg2: String,
  sideimg3: String,
  sideimg4: String,
  title: String,
  price: String,
  description: String,
  Occasion: String,
  Type: String,
  Material: String,
  Colour: String,
  Dimensions: String,
  Pages: String,
  Print: String,
}, { collection: "Products" });  // 👈 important

module.exports = mongoose.model("Products", productSchema);
