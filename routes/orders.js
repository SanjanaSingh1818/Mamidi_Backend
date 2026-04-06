const express = require("express");
const {
  listOrders,
  getOrder,
  updateStatus,
  createOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.get("/", listOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", updateStatus);
router.post("/", createOrder);

module.exports = router;
