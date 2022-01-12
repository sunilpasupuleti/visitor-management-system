const httpstatus = require("http-status-codes");
const Meeting = require("../models/meetingModel");
const Visitor = require("../models/visitorModels");
const Employee = require("../models/employeeModels");
const helpers = require("../helpers/helpers");

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

    if (!purpose || !vehicleNumber) {
      return res
        .status(httpstatus.BAD_REQUEST)
        .json({ message: "Purpose and vehicle number required " });
    }
    let employee = await Employee.findOne({ _id: empId });
    if (employee.status === "disabled") {
      return res.status(httpstatus.BAD_REQUEST).json({
        message: "Cannot place meeting . Employee is in another meeting ",
      });
    }
    // else request for meeting
    const body = {
      employee: { ...employee, _id: empId },
      visitor: req.user,
      meetingRaisedTime: new Date(),
      meetingRequestTime: new Date(),
      additionalMembers: additionalMembers || [],
      otherBelongings: otherBelongings || [],
      company: req.user.company._id,
      status: "upcoming", //upcmoing
      purpose,
      vehicleNumber,
    };

    // again send push token to employeee that meeting was requested

    await Meeting.create(body)
      .then((result) => {
        res.status(httpstatus.OK).json({
          message: "meeting added successfully: ",
          meeting: result,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
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
    const { meetingId, status, meetingMinutesNotes, rescheduledTime } =
      req.body;
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

    let updatedBody = {
      status: status,
    };

    if (status === "accepted") {
      // inprogress /accepted
      updatedBody.isInProgress = true;
      updatedBody.accepted = true;
      updatedBody.meetingAcceptedTime = new Date();
      await Employee.updateOne(
        { _id: details.employee._id },
        { $set: { status: "disabled" } }
      );
    } else if (status === "upcoming") {
      // upcoming
    } else if (status === "completed") {
      if (!meetingMinutesNotes) {
        return res.status(httpstatus.BAD_REQUEST).json({
          message: "No meeting notes was provided",
        });
      }

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
    } else if (status === "rejected") {
      // rejected
      updatedBody.isInProgress = false;
      updatedBody.accepted = false;
      updatedBody.meetingRejectedTime = new Date();
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
      }
    )
      .then((result) => {
        if (!result) {
          return res.status(httpstatus.CONFLICT).json({
            message: "Wrong emp id or meeting id : ",
            status: false,
          });
        }
        res.status(httpstatus.OK).json({
          message: "meeting details updated : ",
          status: true,
        });
      })
      .catch((err) => {
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },

  async searchMeeting(req, res) {
    let searchText = helpers.lowercase(req.body.searchText);

    let meetings = await Meeting.find({})
      .populate("visitor")
      .populate("employee");

    const filteredData = await meetings.filter((e) => {
      return (
        helpers.lowercase(e.visitor.name).includes(searchText) ||
        helpers.lowercase(e.visitor.phone).includes(searchText) ||
        helpers.lowercase(e.visitor.company).includes(searchText) ||
        helpers.lowercase(e.visitor.address).includes(searchText) ||
        helpers.lowercase(e.visitor.area).includes(searchText) ||
        helpers.lowercase(e.employee.name).includes(searchText) ||
        helpers.lowercase(e.employee.email).includes(searchText) ||
        helpers.lowercase(e.employee.phone).includes(searchText) ||
        helpers.lowercase(e.employee.department).includes(searchText) ||
        helpers.lowercase(e.employee.title).includes(searchText)
      );
    });

    return res.status(httpstatus.OK).json({
      message: "Meeting details by searching  : ",
      meetings: filteredData,
    });
  },

  async getAllMeetingByStatus(req, res) {
    const { status } = req.query;
    if (!status) {
      return res.status(httpstatus.BAD_REQUEST).json({
        message: "NO status or limit provided",
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
