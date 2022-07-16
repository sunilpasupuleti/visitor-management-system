const httpstatus = require("http-status-codes");
const Meeting = require("../models/meetingModel");
const Visitor = require("../models/visitorModels");
const Employee = require("../models/employeeModels");
const Companies = require("../models/companyModels");

const helpers = require("../helpers/helpers");
const mongoose = require("mongoose");
const moment = require("moment");
const meetingUpdateSocket = require("../sockets/streams").meetingUpdateSocket;

moment.suppressDeprecationWarnings = true;
const firebase = require("firebase-admin");

async function validateMeetingTimer(meetingId) {
  setTimeout(async () => {
    console.log("meeting timer one minute completed");
    let meeting = await Meeting.findOne({ _id: meetingId });
    if (meeting && meeting.status === "upcoming") {
      await Meeting.deleteOne({ _id: meetingId });
      const db = firebase.firestore();
      await db.collection("meetings").doc(meetingId.toString()).delete();
    }
  }, 60 * 1000);
}

module.exports = {
  async requestForMeeting(req, res) {
    const {
      empId,
      otherBelongings,
      additionalMembers,
      purpose,
      vehicleNumber,
    } = req.body;

    if (!empId || empId.length !== 24) {
      return res
        .status(httpstatus.BAD_REQUEST)
        .json({ message: "No ids or Invalid id's " });
    }

    if (!purpose) {
      return res
        .status(httpstatus.BAD_REQUEST)
        .json({ message: "Purpose is required " });
    }

    let companyExists = req.user.company;
    if (
      companyExists &&
      companyExists.flow &&
      companyExists.flow !== "normal"
    ) {
      return res
        .status(httpstatus.NOT_ACCEPTABLE)
        .json({ message: "Flow mismatch" });
    }

    let ifAlreadyRequested = await Meeting.findOne({
      "employee._id": empId,
      "visitor._id": req.user._id,
      status: "upcoming",
    });
    if (ifAlreadyRequested) {
      return res.status(httpstatus.BAD_REQUEST).json({
        message:
          "Cannot place meeting . Please wait 1 min to request meeting again ",
      });
    }
    let employee;
    await Employee.findOne({
      _id: mongoose.Types.ObjectId(empId),
    }).then((result) => (employee = { ...result._doc }));
    employee._id = empId;

    if (employee.status === "disabled") {
      return res.status(httpstatus.BAD_REQUEST).json({
        message: "Cannot place meeting . Employee is in another meeting ",
      });
    }
    var date = new Date();
    var counterEndTime = date.setSeconds(date.getSeconds() * 60);
    // else request for meeting
    const body = {
      employee: employee,
      visitor: req.user,
      meetingRaisedTime: new Date(),
      meetingRequestTime: new Date(),
      additionalMembers: additionalMembers || [],
      otherBelongings: otherBelongings || [],
      company: req.user.company._id,
      status: "upcoming", //upcmoing
      purpose,
      vehicleNumber,
      counterEndTime,
    };

    // again send push token to employeee that meeting was requested and sms also

    await Meeting.create(body)
      .then(async (result) => {
        let employee = await Employee.findOne({ _id: result.employee._id });
        let fcm = employee.fcmToken;
        firebase.messaging().sendToDevice(fcm, {
          data: {
            meeting: JSON.stringify(result),
          },
        });

        validateMeetingTimer(result._id);

        res.status(httpstatus.OK).json({
          message: "meeting added successfully: ",
          meeting: result,
        });
        const db = firebase.firestore();
        const collection = db.collection("meetings");
        const docName = collection.doc(result._id.toString());
        await docName.set({
          meetingId: result._id.toString(),
          status: "upcoming",
          rejectedReasons: "",
          rescheduledTime: "",
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },

  async requestForMeetingWeb(req, res) {
    const {
      empId,
      otherBelongings,
      additionalMembers,
      purpose,
      vehicleNumber,
    } = req.body;

    if (!empId || empId.length !== 24) {
      return res
        .status(httpstatus.BAD_REQUEST)
        .json({ message: "No ids or Invalid id's " });
    }

    if (!purpose) {
      return res
        .status(httpstatus.BAD_REQUEST)
        .json({ message: "Purpose is required " });
    }

    let companyExists = req.user.company;
    if (
      companyExists &&
      companyExists.flow &&
      companyExists.flow !== "qrcode"
    ) {
      return res
        .status(httpstatus.NOT_ACCEPTABLE)
        .json({ message: "Flow mismatch" });
    }

    let ifAlreadyRequested = await Meeting.findOne({
      "employee._id": empId,
      "visitor._id": req.user._id,
      status: "upcoming",
    });
    if (ifAlreadyRequested) {
      return res.status(httpstatus.BAD_REQUEST).json({
        message:
          "Cannot place meeting . Please wait 1 min to request meeting again ",
      });
    }
    let employee;
    await Employee.findOne({
      _id: mongoose.Types.ObjectId(empId),
    }).then((result) => (employee = { ...result._doc }));
    employee._id = empId;

    if (employee.status === "disabled") {
      return res.status(httpstatus.BAD_REQUEST).json({
        message: "Cannot place meeting . Employee is in another meeting ",
      });
    }
    var date = new Date();
    var counterEndTime = date.setSeconds(date.getSeconds() * 60);
    // else request for meeting
    const body = {
      employee: employee,
      visitor: req.user,
      meetingRaisedTime: new Date(),
      meetingRequestTime: new Date(),
      additionalMembers: additionalMembers || [],
      otherBelongings: otherBelongings || [],
      company: req.user.company._id,
      status: "upcoming", //upcmoing
      purpose,
      vehicleNumber,
      counterEndTime,
    };

    // again send push token to employeee that meeting was requested and sms also

    await Meeting.create(body)
      .then(async (result) => {
        // let employee = await Employee.findOne({ _id: result.employee._id });
        // // let fcm = employee.fcmToken;
        // // firebase.messaging().sendToDevice(fcm, {
        // //   data: {
        // //     meeting: JSON.stringify(result),
        // //   },
        // // });

        // validateMeetingTimer(result._id);

        return res.status(httpstatus.OK).json({
          message: "meeting scheduled successfully: ",
          companyId: req.user.company._id,
        });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(httpstatus.INTERNAL_SERVER_ERROR)
          .json({ message: err });
      });
  },

  async getMeetingDetails(req, res) {
    const meetingId = req.query.meetingId;

    if (!meetingId || meetingId.length !== 24) {
      return res
        .status(httpstatus.BAD_REQUEST)
        .json({ message: "Invalid meetingid provided" });
    }
    await Meeting.findOne({
      _id: meetingId,
    })
      .populate("company")
      .then((result) => {
        res.status(httpstatus.OK).json({
          message: "meeting details : ",
          meeting: result,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },

  async updateMeetingStatus(req, res) {
    const {
      meetingId,
      status,
      meetingMinutesNotes,
      rescheduledTime,
      rejectedReasons,
      meetingEndTime,
    } = req.body;
    if (
      // !empId ||
      !meetingId ||
      !status ||
      meetingId.length !== 24
      // empId.length !== 24
    ) {
      return res.status(httpstatus.BAD_REQUEST).json({
        message: "There was no details provided || Invalid ids provided",
      });
    }

    let details = await Meeting.findOne({ _id: meetingId });

    if (!details) {
      return res.status(httpstatus.OK).json({
        message: "There was no meeting  : ",
      });
    }

    let smsBody = {
      flow_id: "620261209d55105de41f7076",
      sender: "1301164284980237231",
      mobiles: details.visitor.phone,
      name: helpers.capitalize(details.visitor.name),
      status: "",
    };

    let updatedBody = {
      status: status,
    };

    if (status === "accepted") {
      // inprogress /accepted
      updatedBody.isInProgress = true;
      updatedBody.accepted = true;
      updatedBody.meetingAcceptedTime = new Date();
      smsBody.status = helpers.capitalize(status);
      await Employee.updateOne(
        { _id: details.employee._id },
        { $set: { status: "disabled" } }
      );
    } else if (status === "upcoming") {
      // upcoming
    } else if (status === "completed") {
      if (!meetingMinutesNotes) {
        return res.status(httpstatus.BAD_REQUEST).json({
          message: "No meeting notes was provided ",
        });
      }
      if (!meetingEndTime) {
        return res.status(httpstatus.BAD_REQUEST).json({
          message: "Please provide meeting end time ! (meetingEndTime)  ",
        });
      }

      let raisedTime = moment(details.meetingRaisedTime).format(
        "MMM-DD-YYYY-hh:mm:ss"
      );
      let endTime = moment(+meetingEndTime).format("MMM-DD-YYYY-hh:mm:ss");
      let duration = moment.duration(moment(endTime).diff(raisedTime));
      let durationHours = duration.hours();
      let durationMin = duration.minutes();
      let durationSec = duration.seconds();

      duration = durationHours + "h " + durationMin + "m " + durationSec + "s";

      updatedBody.duration = duration;
      // get vis Id and emp Id
      await Visitor.updateOne(
        {
          _id: details.visitor._id,
        },
        {
          $inc: {
            totalMeetingsDone: 1,
          },
        }
      );
      await Employee.updateOne(
        {
          _id: details.employee._id,
        },
        {
          $set: { status: "enabled" },
          $inc: { totalMeetingsDone: 1 },
        }
      );
      // completed
      updatedBody.meetingEndTime = new Date();
      updatedBody.meetingMinutesNotes = meetingMinutesNotes;
      updatedBody.isInProgress = false;
      smsBody.status = helpers.capitalize(status);
    } else if (status === "rejected") {
      // rejected
      if (!rejectedReasons) {
        return res.status(httpstatus.BAD_REQUEST).json({
          message: "No rejected reasons was provided",
        });
      }
      updatedBody.isInProgress = false;
      updatedBody.rejectedReasons = rejectedReasons;
      updatedBody.accepted = false;
      updatedBody.meetingRejectedTime = new Date();
      smsBody.status =
        helpers.capitalize(status) + " due to " + rejectedReasons;

      await Employee.updateOne(
        {
          _id: details.employee._id,
        },
        {
          $set: { status: "enabled" },
        }
      );
    } else if (status === "reschedule") {
      // reschedule time

      if (!rescheduledTime) {
        return res.status(httpstatus.BAD_REQUEST).json({
          message: "No rescheduled time was provided",
        });
      }
      updatedBody.accepted = false;
      updatedBody.rescheduled = true;

      updatedBody.meetingRescheduledOn = new Date(+rescheduledTime);
      smsBody.status =
        helpers.capitalize("rescheduled") +
        " to " +
        moment(+rescheduledTime).format("MMM DD , YYYY hh:mm a");

      await Employee.updateOne(
        {
          _id: details.employee._id,
        },
        {
          $set: { status: "enabled" },
        }
      );
    }

    await Meeting.findOneAndUpdate(
      {
        _id: meetingId,
      },
      {
        $set: {
          ...updatedBody,
        },
      },
      {
        new: true,
      }
    )
      .then(async (result) => {
        const db = firebase.firestore();
        const collection = db.collection("meetings");
        const docName = collection.doc(result._id.toString());
        await docName.update({
          status: status,
          rejectedReasons: rejectedReasons ? rejectedReasons : "",
          rescheduledTime: rescheduledTime ? new Date(+rescheduledTime) : "",
        });
        const smsUrl = "https://api.msg91.com/api/v5/flow/";
        const headers = {
          "Content-Type": "application/json",
          authKey: process.env.MSG91_AUTHKEY,
        };
        const axios = require("axios");

        res.status(httpstatus.OK).json({
          message: "meeting details updated : ",
          status: true,
        });
        axios
          .post(smsUrl, JSON.stringify(smsBody), { headers: headers })
          .then((response) => {
            console.log(
              "Status updated otp has been sent successfully" + response
            );
          })
          .catch((err) => {
            console.log("err in sending message" + err);
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },

  async searchMeeting(req, res) {
    let meeting = await Meeting.findOne({
      "employee._id": req.user._id.toString(),
      status: "upcoming",
    });

    return res.status(httpstatus.OK).json({
      message: "Meeting details by searching  : ",
      currentTime: new Date(),
      meeting,
    });
  },

  async getAllMeetingByStatus(req, res) {
    const { status } = req.query;
    if (!status) {
      return res.status(httpstatus.BAD_REQUEST).json({
        message: "NO status  provided",
      });
    }
    await Meeting.find({
      company: req.user.company._id,
      status: status,
    })
      .populate("company")
      .then((result) => {
        res.status(httpstatus.OK).json({
          message: "meeting details  : ",
          meetings: result,
        });
      })
      .catch((err) => {
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },

  async getVisitorMeetings(req, res) {
    const { visitorId } = req.query;
    if (!visitorId || visitorId.length !== 24) {
      return res
        .status(httpstatus.CONFLICT)
        .json({ message: "No visitor Id or Invalid visiitor Id" });
    }

    await Meeting.find({
      visitor: visitorId,
    })
      .populate("company")
      .then((result) => {
        res.status(httpstatus.OK).json({
          message: "visitor meeting details  : ",
          meetings: result,
        });
      })
      .catch((err) => {
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },
};
