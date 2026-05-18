const Category = require("../models/Category");

const slugify = (name) =>
  name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

// GET /api/categories
exports.list = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
};

// POST /api/categories
exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }
    const slug = slugify(name);
    const existing = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }
    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// PUT /api/categories/:id
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const slug = slugify(name);
    const existing = await Category.findOne({
      $or: [{ name }, { slug }],
      _id: { $ne: id }
    });

    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    category.name = name;
    category.slug = slug;
    await category.save();
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.deleteOne({ _id: id });
    res.json({ message: "Category deleted successfully", id });
  } catch (err) {
    next(err);
  }
};
