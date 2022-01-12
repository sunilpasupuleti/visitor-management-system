const mongoose = require("mongoose");

const employeeSchema = mongoose.Schema(
  {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    password: { type: String },
    uid: { type: String },
    pushToken: { type: String },
    image: { type: Object },
    department: { type: String },
    fcmToken: { type: String },
    status: { type: String },
    title: { type: String },
    totalMeetingsDone: { type: Number, default: 0 },
    employeeAdeedOn: { type: Date, default: new Date() },
    isOnVacationMode: { type: Boolean, default: false },
    role: { type: String, default: "employee" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  },
  { strict: false, timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
