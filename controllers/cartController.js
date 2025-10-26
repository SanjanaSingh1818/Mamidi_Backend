// controllers/cartController.js
const Cart = require("../models/Cart");

// Add item
const addToCart = async (req, res) => {
  try {
    const { userId, productId, title, price, main, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, title, price, main, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update quantity
const updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { "items._id": id },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove item
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { "items._id": id },
      { $pull: { items: { _id: id } } },
      { new: true }
    );

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { items: [] } },
      { new: true }
    );

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};
