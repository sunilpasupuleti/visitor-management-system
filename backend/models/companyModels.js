const mongoose = require("mongoose");

const companySchema = mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    address: { type: String },
    expiresAt: { type: Date },
  },
  { strict: false, timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
