const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

// Middleware for multiple fields
const uploadFields = upload.fields([
  { name: 'main', maxCount: 10 },
  { name: 'sideimg1', maxCount: 10 },
  { name: 'sideimg2', maxCount: 10 },
  { name: 'sideimg3', maxCount: 10 },
  { name: 'sideimg4', maxCount: 10 }
]);

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
router.post("/", uploadFields, async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Process images
    const imageFields = ['main', 'sideimg1', 'sideimg2', 'sideimg3', 'sideimg4'];
    imageFields.forEach(field => {
      const images = [];
      // Add URLs if provided
      if (payload[field]) {
        if (Array.isArray(payload[field])) {
          payload[field].forEach(url => {
            if (url) images.push({ type: 'url', value: url });
          });
        } else if (typeof payload[field] === 'string' && payload[field]) {
          images.push({ type: 'url', value: payload[field] });
        }
      }
      // Add uploaded files
      if (req.files && req.files[field]) {
        req.files[field].forEach(file => {
          images.push({ type: 'file', value: file.path }); 
        });
      }
      payload[field] = images;
    });

    const product = new Product(payload);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - update product
router.put("/:id", uploadFields, async (req, res, next) => {
  try {
    console.log(`[PUT /api/products/${req.params.id}] Updating...`);
    console.log("req.body:", req.body);
    console.log("req.files:", req.files ? Object.keys(req.files) : "none");

    const payload = { ...req.body };

    // Process images
    const imageFields = ['main', 'sideimg1', 'sideimg2', 'sideimg3', 'sideimg4'];
    imageFields.forEach(field => {
      const images = [];
      // Add URLs if provided
      if (payload[field]) {
        if (Array.isArray(payload[field])) {
          payload[field].forEach(url => {
            if (url) images.push({ type: 'url', value: url });
          });
        } else if (typeof payload[field] === 'string' && payload[field]) {
          images.push({ type: 'url', value: payload[field] });
        }
      }
      // Add uploaded files
      if (req.files && req.files[field]) {
        req.files[field].forEach(file => {
          images.push({ type: 'file', value: file.path });
        });
      }
      payload[field] = images;
    });

    console.log("Final payload:", JSON.stringify(payload, null, 2));

    const updated = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    console.log(`[PUT /api/products/${req.params.id}] Success`);
    res.json(updated);
  } catch (err) {
    console.error(`[PUT /api/products/${req.params.id}] Error:`, {
      message: err.message,
      code: err.code,
      details: err.errors || err.message
    });
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
