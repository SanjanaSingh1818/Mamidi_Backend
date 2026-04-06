const Orders = require("../models/Order");

function parseRange(range = "30d") {
  const match = /^(\d+)([dwmy])$/.exec(range);
  if (!match) return 30 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = { d: 1, w: 7, m: 30, y: 365 };
  return value * (multipliers[unit] ?? 30) * 24 * 60 * 60 * 1000;
}

exports.revenue = async (req, res, next) => {
  try {
    const rangeMs = parseRange(req.query.range);
    const since = new Date(Date.now() - rangeMs);

    const [{ total = 0 } = {}] = await Orders.aggregate([
      { $match: { placedAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    res.json({ total, currency: "USD", range: req.query.range || "30d" });
  } catch (err) {
    next(err);
  }
};

exports.orderStats = async (req, res, next) => {
  try {
    const range = req.query.range || "30d";
    const rangeMs = parseRange(range);
    const since = new Date(Date.now() - rangeMs);
    const prevSince = new Date(since.getTime() - rangeMs);

    const [current, previous] = await Promise.all([
      Orders.aggregate([
        { $match: { placedAt: { $gte: since } } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            total: { $sum: "$total" },
          },
        },
      ]),
      Orders.aggregate([
        { $match: { placedAt: { $gte: prevSince, $lt: since } } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            total: { $sum: "$total" },
          },
        },
      ]),
    ]);

    const currentAgg = current[0] || { count: 0, total: 0 };
    const prevAgg = previous[0] || { count: 0, total: 0 };

    const avgValue =
      currentAgg.count > 0 ? currentAgg.total / currentAgg.count : 0;

    const deltaPct =
      prevAgg.count === 0
        ? currentAgg.count > 0
          ? 100
          : 0
        : ((currentAgg.count - prevAgg.count) / prevAgg.count) * 100;

    res.json({
      count: currentAgg.count,
      avgValue,
      deltaPct,
      range,
    });
  } catch (err) {
    next(err);
  }
};

exports.bestSellers = async (req, res, next) => {
  try {
    const rangeMs = parseRange(req.query.range || "90d");
    const since = new Date(Date.now() - rangeMs);
    const limit = Number(req.query.limit) || 5;

    const items = await Orders.aggregate([
      { $match: { placedAt: { $gte: since } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          title: { $first: "$items.title" },
          units: { $sum: "$items.quantity" },
          price: { $first: "$items.price" },
          image: { $first: "$items.image" },
        },
      },
      { $sort: { units: -1 } },
      { $limit: limit },
    ]);

    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.activity = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const items = await Orders.find({})
      .sort({ placedAt: -1 })
      .limit(limit)
      .select({ orderId: 1, "customer.name": 1, total: 1, status: 1, placedAt: 1 });

    const transformed = items.map((o) => ({
      id: o.orderId,
      customer: o.customer?.name,
      amount: o.total,
      status: o.status,
      occurredAt: o.placedAt,
    }));

    res.json({ items: transformed });
  } catch (err) {
    next(err);
  }
};
