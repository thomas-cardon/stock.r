const mongoose = require('mongoose');

let ProductSchema = new mongoose.Schema({
  id: { type: String, default: generate() },
  image: { type: String, default: 'http://via.placeholder.com/250x300?text=Pas%20d%27image' },
  name: String,
  metadata: [String],
  desc: { type: String, default: 'Cet objet n\'a pas de description.' },
  qty: { type: Number, default: 0 },
  price: { type: String, required: true },
  location: String,
  creationDate: { type: Date, required: true, default: new Date() },
  disabled: { type: Boolean, default: false }
});

module.exports = ProductSchema;
