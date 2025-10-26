// routes/cartRoutes.js
const express = require("express");
const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const router = express.Router();

// Add product to cart
router.post("/", addToCart);

// Get user cart
router.get("/:userId", getCart);

// Update quantity
router.put("/:id", updateQuantity);

// Remove item
router.delete("/:id", removeFromCart);

// Clear all items for a user
router.delete("/clear/:userId", clearCart);

module.exports = router; // ✅ important for CommonJS
