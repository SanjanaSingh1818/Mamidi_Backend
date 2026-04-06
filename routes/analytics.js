const express = require("express");
const {
  revenue,
  orderStats,
  bestSellers,
  activity,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/revenue", revenue);
router.get("/orders", orderStats);
router.get("/best-sellers", bestSellers);
router.get("/activity", activity);

module.exports = router;
