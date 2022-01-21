const httpstatus = require("http-status-codes");
const Visitor = require("../models/visitorModels");
const Employee = require("../models/employeeModels");

const Meeting = require("../models/meetingModel");
const mongoose = require("mongoose");
const helper = require("../helpers/helpers");
const firebase = require("firebase-admin");
const jwt = require("jsonwebtoken");
const companyModels = require("../models/companyModels");

module.exports = {
  async searchVisitorNumber(req, res) {
    var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!req.query.phone.match(phoneno)) {
      return res
        .status(httpstatus.CONFLICT)
        .json({ message: "Invalid phone number" });
    }

    await Visitor.findOne({
      phone: req.query.phone,
    })
      .populate("company")
      .then((result) => {
        if (!result) {
          var otp = "123456";
          // sending otp..........
          return res.status(httpstatus.OK).json({
            message: "Otp was sent successfully  : ",
            otp,
            visitor: result,
          });
        } else {
          const token = jwt.sign({ data: result }, process.env.SECRETS, {
            expiresIn: "1h",
          });

          return res
            .status(httpstatus.OK)
            .json({ message: "Visitor details : ", visitor: result, token });
        }
      })
      .catch((err) => {
        return res
          .status(httpstatus.INTERNAL_SERVER_ERROR)
          .json({ message: err });
      });
  },

  async resendOtp(req, res) {
    // resend otp functionality
  },

  async saveVisitor(req, res) {
    const {
      name,
      company,
      address,
      selfieLink,
      idType,
      idLink,
      phone,
      companyName,
    } = req.body;
    if (
      !name ||
      !company ||
      !companyName ||
      !phone ||
      !address ||
      !selfieLink ||
      !idType ||
      !idLink
    ) {
      return res
        .status(httpstatus.CONFLICT)
        .json({ message: "All fields required" });
    }

    var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!phone.match(phoneno)) {
      return res
        .status(httpstatus.CONFLICT)
        .json({ message: "Invalid phone number" });
    }

    var exists = await Visitor.findOne({
      phone: phone,
    });
    if (exists) {
      return res
        .status(httpstatus.CONFLICT)
        .json({ message: "Visitor already exists" });
    }

    var companyExists = await companyModels.findOne({ _id: company });
    if (!companyExists) {
      return res.status(httpstatus.OK).json({
        message: "Company Id is invalid : ",
      });
    }
    const visitorDetails = {
      name: helper.capitalize(req.body.name),
      phone: req.body.phone,
      address,
      idLink,
      idType,
      selfieLink,
      company,
      companyName,
    };

    // send otp functionality remaining

    await Visitor.create(visitorDetails)
      .then(async (result) => {
        let details = await Visitor.findOne({ _id: result._id }).populate(
          "company"
        );
        const token = jwt.sign({ data: details }, process.env.SECRETS, {
          expiresIn: "1h",
        });

        return res.status(httpstatus.OK).json({
          message: "Visitor created successfully : ",
          visitor: details,
          token,
        });
      })
      .catch((err) => {
        return res
          .status(httpstatus.INTERNAL_SERVER_ERROR)
          .json({ message: err });
      });
    // });
  },

  async getAllVisitors(req, res) {
    await Visitor.find({
      company: req.user.company._id,
    })
      .populate("company")
      .then((result) => {
        res.status(httpstatus.OK).json({
          message: "All visitors",
          visitors: result,
        });
      })
      .catch((err) => {
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },

  async getEmployees(req, res) {
    await Employee.find({
      company: req.user.company._id,
    })
      .populate("company")
      .then((result) => {
        res.status(httpstatus.OK).json({
          message: "All employees",
          employees: result,
        });
      })
      .catch((err) => {
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },

  async getVisitorDetails(req, res) {
    let { visitorId } = req.query;
    let meetings;
    let visitor;
    let currentMeetingsOnSite;
    let upComingMeetings;
    let totalMeetingsDone = {};
    let employees;
    let body = {};

    const { custom, startTime, endTime } = req.query;

    if (!visitorId || visitorId.length !== 24) {
      return res
        .status(httpstatus.CONFLICT)
        .json({ message: "No visitor Id or Invalid visiitor Id" });
    }

    // visitorId = mongoose.Types.ObjectId(visitorId);

    const details = async () => {
      if (custom === "true") {
        const totMeetDone = await Meeting.find({
          status: "completed",
          "visitor._id": visitorId,
          meetingEndTime: {
            $gte: new Date(+startTime),
            $lt: new Date(+endTime),
          },
        });

        const totRejDone = await Meeting.find({
          status: "rejected",
          "visitor._id": visitorId,
          meetingRejectedTime: {
            $gte: new Date(+startTime),
            $lt: new Date(+endTime),
          },
        });

        const totResDone = await Meeting.find({
          status: "reschedule",
          "visitor._id": visitorId,
          meetingRescheduledOn: {
            $gte: new Date(+startTime),
            $lt: new Date(+endTime),
          },
        });

        meetings = await Meeting.find({
          "visitor._id": visitorId,
          meetingEndTime: {
            $gte: new Date(+startTime),
            $lt: new Date(+endTime),
          },
        });

        body.totalMeetingsDoneLength = totMeetDone.length;
        body.totalRejectedMeetingsDoneLength = totRejDone.length;
        body.totalRescheduledMeetingsDoneLength = totResDone.length;
      } else {
        const totMeetDone = await Meeting.find({
          status: "completed",
          "visitor._id": visitorId,
        });

        const totRejDone = await Meeting.find({
          status: "rejected",
          "visitor._id": visitorId,
        });

        const totResDone = await Meeting.find({
          status: "reschedule",
          "visitor._id": visitorId,
        });

        meetings = await Meeting.find({
          "visitor._id": visitorId,
        });

        body.totalMeetingsDoneLength = totMeetDone.length;
        body.totalRejectedMeetingsDoneLength = totRejDone.length;
        body.totalRescheduledMeetingsDoneLength = totResDone.length;
      }

      currentMeetingsOnSite = await Meeting.find({
        "visitor._id": visitorId,
        isInProgress: true,
      }).count();

      upComingMeetings = await Meeting.find({
        "visitor._id": visitorId,
        isInProgress: false,
        status: "upcoming",
      }).count();

      // let visitorId = mongoose.Types.ObjectId(visitorId);

      const totMeetDoneToday = await Meeting.aggregate([
        {
          $match: {
            "visitor._id": visitorId,
            status: "completed",
            $expr: {
              $and: [
                {
                  $eq: [
                    { $dayOfMonth: "$meetingEndTime" },
                    { $dayOfMonth: new Date() },
                  ],
                },
                {
                  $eq: [{ $month: "$meetingEndTime" }, { $month: new Date() }],
                },
                {
                  $eq: [{ $year: "$meetingEndTime" }, { $year: new Date() }],
                },
              ],
            },
          },
        },
      ]);

      totalMeetingsDone.today = totMeetDoneToday.length;

      // this week total meetings

      const thisWeekMeetings = await Meeting.aggregate([
        {
          $match: {
            "visitor._id": visitorId,
            status: "completed",
            $expr: {
              $eq: [{ $week: "$meetingEndTime" }, { $week: new Date() }],
            },
          },
        },
        {
          $project: {
            meetingEndTime: {
              $dateFromParts: {
                year: { $year: new Date() },
                month: { $month: "$meetingEndTime" },
                day: { $dayOfMonth: "$meetingEndTime" },
              },
            },
          },
        },
      ]);

      totalMeetingsDone.thisWeek = thisWeekMeetings.length;

      // this month total meetings

      const thisMonthcompletedMeetings = await Meeting.aggregate([
        {
          $match: {
            "visitor._id": visitorId,
            status: "completed",
            $expr: {
              $and: [
                {
                  $eq: [{ $month: "$meetingEndTime" }, { $month: new Date() }],
                },
                {
                  $eq: [{ $year: "$meetingEndTime" }, { $year: new Date() }],
                },
              ],
            },
          },
        },
      ]);

      totalMeetingsDone.thisMonth = thisMonthcompletedMeetings.length;

      // this year meetings

      const thisYearcompletedMeetings = await Meeting.aggregate([
        {
          $match: {
            "visitor._id": visitorId,
            status: "completed",
            $expr: {
              $eq: [{ $year: "$meetingEndTime" }, { $year: new Date() }],
            },
          },
        },
      ]);

      totalMeetingsDone.thisYear = thisYearcompletedMeetings.length;

      visitor = await Visitor.findOne({
        _id: visitorId,
      });

      employees = await Employee.find({ company: req.user.company._id })
        .select({
          name: 1,
        })
        .sort({ name: 1 });

      let meetingsByMonthAndYear = await Meeting.aggregate([
        {
          $match: {
            "visitor._id": visitorId,
            status: "completed",
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$meetingEndTime" },
              month: { $month: "$meetingEndTime" },
            },
            countMeetings: { $sum: 1 },
          },
        },
      ]);

      body = {
        ...body,
        visitor,
        meetings,
        currentMeetingsOnSite,
        upComingMeetings,
        totalMeetingsDone,
        meetingsByMonthAndYear,
        employees,
      };
    };

    details()
      .then(() => {
        res.status(httpstatus.OK).json({
          message: "Visitor by id",
          ...body,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },
};
