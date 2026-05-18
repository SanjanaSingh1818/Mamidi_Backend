const express = require("express");
const { list, create, update, delete: deleteCategory } = require("../controllers/categoryController");

const router = express.Router();

router.get("/", list);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", deleteCategory);

module.exports = router;
