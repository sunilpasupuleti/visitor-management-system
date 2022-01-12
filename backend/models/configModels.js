const mongoose = require("mongoose");

const configSchema = mongoose.Schema(
  {
    departments: [],
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  },
  { strict: false }
);

module.exports = mongoose.model("Config", configSchema);
