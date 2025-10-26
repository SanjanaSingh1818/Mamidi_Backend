const express = require("express");
const router = express.Router();
const Product = require("../models/Products");

// GET /api/products - list all products (with optional ?search= and pagination)
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};

    if (search) {
      // basic title search (case-insensitive)
      query.title = { $regex: search, $options: "i" };
    }

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({ data: products, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products - create product
router.post("/", async (req, res, next) => {
  try {
    const payload = req.body;
    const product = new Product(payload);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - update product
router.put("/:id", async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const del = await Product.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
