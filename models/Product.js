const mongoose = require('mongoose');

let ProductSchema = new mongoose.Schema({
  id: { type: String, default: generate() },
  image: String,
  name: String,
  metadata: [Array],
  qty: Number,
  price: Number,
  location: String
});

module.exports = ProductSchema;
