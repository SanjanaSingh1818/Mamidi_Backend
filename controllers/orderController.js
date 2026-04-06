const Orders = require("../models/Order");

// GET /api/orders
exports.listOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search, // search by orderId or customer name
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Orders.find(query)
      .sort({ placedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Orders.countDocuments(query);

    res.json({
      data: orders,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Orders.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "shipped", "delivered", "issue", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Orders.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload.orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }
    const order = await Orders.create(payload);
    res.status(201).json(order);
  } catch (err) {
    // handle unique conflict on orderId gracefully
    if (err.code === 11000) {
      return res.status(409).json({ message: "orderId already exists" });
    }
    next(err);
  }
};
