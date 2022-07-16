const mongoose = require("mongoose");

const meetingsSchema = mongoose.Schema(
  {
    visitor: { type: Object, _id: { type: String } },
    employee: { type: Object, _id: { type: String } },
    meetingRaisedTime: { type: Date },
    meetingRequestTime: { type: Date },
    meetingAcceptedTime: { type: Date },
    meetingRejectedTime: { type: Date },
    accepted: { type: Boolean, default: false },
    rescheduled: { type: Boolean, default: false },
    meetingRescheduledOn: { type: Date },
    status: { type: String }, // 0/1/2/3/4 ( 0 : inprogress, 1 : upcoming, 2 : completed, 3: rejected, 4:reschduled)
    additionalMembers: [
      {
        name: { type: String },
        phone: { type: String },
      },
    ],
    otherBelongings: [],
    isInProgress: { type: Boolean, default: false },
    meetingEndTime: { type: Date },
    meetingMinutesNotes: { type: String },
    purpose: { type: String },
    vehicleNumber: { type: String },
    rejectedReasons: { type: String },
    gateExitTime: { type: Date },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    counterEndTime: { type: Date },
    duration: { type: String },
  },
  { strict: false, timstamps: true }
);

module.exports = mongoose.model("Meetings", meetingsSchema);
