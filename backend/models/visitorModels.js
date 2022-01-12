const mongoose = require("mongoose");

const visitorSchema = mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    idLink: { type: String },
    idType: { type: String },
    selfieLink: { type: String },
    totalMeetingsDone: { type: Number, default: 0 },
    companyName: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  },
  { strict: false, timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
