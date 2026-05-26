const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");
const Product = require("../models/Products");

const router = express.Router();

const SIDE_IMAGE_LIMIT = 12;

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "products",
    resource_type: "image",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  }),
});

const upload = multer({
  storage,
  limits: {
    files: SIDE_IMAGE_LIMIT + 1,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      return cb(createHttpError("Only image files are allowed"));
    }

    cb(null, true);
  },
});

const uploadProductImages = upload.fields([
  { name: "main", maxCount: 1 },
  { name: "sideImages", maxCount: SIDE_IMAGE_LIMIT },
]);

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;

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
      value: file.path,
    }))
    .filter((image) => image.value);

  return [...existingImages, ...uploadedImages];
}

function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function hasImageField(req, field) {
  return (
    Object.prototype.hasOwnProperty.call(req.body, field) ||
    Boolean(req.files?.[field]?.length)
  );
}

function buildProductPayload(req, { preserveMissingImages = false } = {}) {
  const payload = { ...req.body };

  if (!payload.Type && payload.category) {
    payload.Type = payload.category;
  }

  delete payload.category;
  delete payload.gallery;

  const mainWasProvided = hasImageField(req, "main");
  const main = buildImageEntries("main", req);
  delete payload.main;

  if (main.length > 1) {
    throw createHttpError("Only one main image is allowed");
  }

  if (!preserveMissingImages && main.length !== 1) {
    throw createHttpError("One main image is required");
  }

  if (main.length || !preserveMissingImages || mainWasProvided) {
    payload.main = main;
  }

  const sideImagesWereProvided = hasImageField(req, "sideImages");
  const sideImages = buildImageEntries("sideImages", req);
  delete payload.sideImages;

  if (sideImages.length > SIDE_IMAGE_LIMIT) {
    throw createHttpError(`A product can have at most ${SIDE_IMAGE_LIMIT} side images`);
  }

  if (sideImages.length || !preserveMissingImages || sideImagesWereProvided) {
    payload.sideImages = sideImages;
  }

  return payload;
}

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, type } = req.query;
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (category || type) {
      const filterValue = category || type;
      query.Type = { $regex: filterValue, $options: "i" };
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

router.get("/by-type/:type", async (req, res, next) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const products = await Product.find({
      Type: { $regex: type, $options: "i" },
    })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({
      Type: { $regex: type, $options: "i" },
    });

    res.json({ data: products, total, page: Number(page), limit: Number(limit), type });
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

router.post("/", uploadProductImages, async (req, res, next) => {
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

router.put("/:id", uploadProductImages, async (req, res, next) => {
  try {
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

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_UNEXPECTED_FILE"
        ? "Unexpected image field or too many images uploaded"
        : err.message;

    return res.status(400).json({ message });
  }

  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  next(err);
});

module.exports = router;
