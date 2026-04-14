const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  main: {
    type: [{ type: { category: String, enum: ['file'] }, value: String }],
    default: []
  },
  sideimg1: {
    type: [{ type: { category: String, enum: ['file'] }, value: String }],
    default: []
  },
  sideimg2: {
    type: [{ type: { category: String, enum: ['file'] }, value: String }],
    default: []
  },
  sideimg3: {
    type: [{ type: { category: String, enum: ['file'] }, value: String }],
    default: []
  },
  sideimg4: {
    type: [{ type: { category: String, enum: ['file'] }, value: String }],
    default: []
  },
  title: String,
  price: String,
  description: String,
  Occasion: String,
  category: String,
  Material: String,
  Colour: String,
  Dimensions: String,
  Pages: String,
  Print: String,
}, { collection: "Products" });  // 👈 important

module.exports = mongoose.model("Products", productSchema);
