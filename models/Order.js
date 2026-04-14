const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String },
      avatar: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    items: { type: [orderItemSchema], required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "shipped",
        "delivered",
        "issue",
        "cancelled",
        "complete",
        "paid",
        "unpaid",
      ],
      default: "pending",
    },
    total: { type: Number, required: true },
    placedAt: { type: Date, default: Date.now },
    shipping: {
      method: { type: String },
      trackingNumber: { type: String },
      expectedDate: { type: Date },
    },
    notes: { type: String },
  },
  { collection: "Orders", timestamps: true }
);

module.exports = mongoose.model("Orders", orderSchema);
