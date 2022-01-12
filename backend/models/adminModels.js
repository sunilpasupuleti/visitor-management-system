const mongoose = require("mongoose");

const adminSchema = mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    password: { type: String },
    uid: { type: String },
    pushToken: { type: String },
    title: { type: String },
    role: { type: String },
    fcmToken: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  },
  { strict: false, timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
