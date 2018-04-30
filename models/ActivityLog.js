const mongoose = require('mongoose');

let ActivityLogSchema = new mongoose.Schema({
  user: String,
  line: { type: String, required: true },
  ip: { type: String, required: true }
});

module.exports = ActivityLogSchema;
