const Category = require("../models/Category");
const Products = require("../models/Products");

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
    const newSlug = slugify(name);
    const existing = await Category.findOne({
      $or: [{ name }, { slug: newSlug }],
      _id: { $ne: id }
    });
    if (existing) {
      return res.status(409).json({ message: "Category name or slug already exists" });
    }
    // Update products' Type if name changed
    if (category.name !== name) {
      await Products.updateMany({ Type: category.name }, { Type: name });
    }
    category.name = name;
    category.slug = newSlug;
    await category.save();
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    // Check if any products are linked
    const linkedProducts = await Products.countDocuments({ Type: category.name });
    if (linkedProducts > 0) {
      return res.status(409).json({
        message: `Cannot delete category. ${linkedProducts} product(s) are linked to this category. Please reassign or remove the products first.`
      });
    }
    await Category.findByIdAndDelete(id);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
};
