const mongoose = require("mongoose");

const SIDE_IMAGE_LIMIT = 12;

const imageSchema = {
  type: {
    type: String,
    enum: ["file"],
  },
  value: String,
};

const productSchema = new mongoose.Schema(
  {
    // MAIN IMAGE
    main: {
      type: [imageSchema],
      default: [],
      validate: {
        validator: (images) => images.length === 1,
        message: "A product must have exactly one main image",
      },
    },

    // SIDE IMAGES (UP TO 12)
    sideImages: {
      type: [imageSchema],
      default: [],
      validate: {
        validator: (images) => images.length <= SIDE_IMAGE_LIMIT,
        message: `A product can have at most ${SIDE_IMAGE_LIMIT} side images`,
      },
    },

    title: String,
    price: String,
    description: String,
    Occasion: String,
    Type: String,
    Material: String,
    Colour: String,
    Dimensions: String,
    Pages: String,
    Print: String,
  },
  {
    collection: "Products",
  }
);

module.exports = mongoose.model(
  "Products",
  productSchema
);
