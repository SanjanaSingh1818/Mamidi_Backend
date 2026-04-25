const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");
const Product = require("../models/Products");

const router = express.Router();

const imageFields = ["main", "sideimg1", "sideimg2", "sideimg3", "sideimg4"];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "products",
    resource_type: "image",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  }),
});

const upload = multer({ storage });
const uploadFields = upload.fields(
  imageFields.map((name) => ({ name, maxCount: 10 }))
);

function toArray(value) {
  if (!value) return [];

  // if already array
  if (Array.isArray(value)) return value;

  // try parsing JSON string
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [value];
  }
}

function buildImageEntries(field, req) {
  const existingImages = toArray(req.body[field])
    .map((value) => ({
      type: "file",
      value: typeof value === "object" ? value.value : value,
    }))
    .filter((image) => image.value);

  const uploadedImages = (req.files?.[field] || [])
    .map((file) => ({
      type: "file",
      value: file.path, // Cloudinary URL
    }))
    .filter((image) => image.value);

  return [...existingImages, ...uploadedImages];
}

function buildProductPayload(req, { preserveMissingImages = false } = {}) {
  const payload = { ...req.body };

  // No need to map Type to category anymore - frontend now sends "category" directly
  // Remove any legacy Type field if present
  delete payload.Type;

  imageFields.forEach((field) => {
    const images = buildImageEntries(field, req);
    delete payload[field];

    if (images.length || !preserveMissingImages) {
      payload[field] = images;
    }
  });

  return payload;
}

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};

    if (search) {
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

router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.post("/", uploadFields, async (req, res, next) => {
  try {

    const payload = buildProductPayload(req);
    const product = await Product.create(payload);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    next(err);
  }

});

router.put("/:id", uploadFields, async (req, res, next) => {
  try {
 console.log("BODY 👉", req.body);
    console.log("FILES 👉", req.files);

    const payload = buildProductPayload(req, { preserveMissingImages: true });
    const updated = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const del = await Product.findByIdAndDelete(req.params.id);

    if (!del) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
