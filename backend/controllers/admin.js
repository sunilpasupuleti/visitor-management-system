const httpstatus = require("http-status-codes");
const Config = require("../models/configModels");
const Meeting = require("../models/meetingModel");
const Employee = require("../models/employeeModels");
const Visitor = require("../models/visitorModels");
const Admin = require("../models/adminModels");

const helper = require("../helpers/helpers");
const moment = require("moment");
const company = require("./company");
const mongoose = require("mongoose");
module.exports = {
  async getDepartments(req, res) {
    await Config.findOne({ company: req.user.company._id })
      .populate("company")
      .then((data) => {
        return res.status(httpstatus.OK).json({
          message: "Departments",
          departments: data,
        });
      })
      .catch((err) => {
        return res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
          message: "Error in sending details",
        });
      });
  },

  // for qr flow
  async getAdmin(req, res) {
    let { uid } = req.query;
    if (!uid) {
      return res.status(httpstatus.CONFLICT).json({
        message: "No UID Passed",
      });
    }

    let result = await Admin.findOne({ uid: uid }).populate("company");

    if (!result) {
      res.status(httpstatus.CONFLICT).json({ message: "Invalid uid" });
      return;
    }
    console.log(result);
    if (
      !result.company ||
      !result.company.flow ||
      result.company.flow !== "qrcode" ||
      result.role !== "Admin"
    ) {
      res
        .status(httpstatus.CONFLICT)
        .json({ message: "You are not allowed to login.", allowed: false });
      return;
    } else {
      return res.status(httpstatus.OK).json({
        message: "Data fetched successfully",
        data: result,
        allowed: true,
      });
    }
  },

  async setDepartments(req, res) {
    const { departments } = req.body;
    if (departments.length === 0) {
      return res.status(httpstatus.BAD_REQUEST).json({
        message: "Provide Department",
      });
    }
    departments.forEach((element, index) => {
      departments[index] = helper.uppercase(element);
    });

    // check if model already exists
    const modelData = await Config.findOne({ company: req.user.company._id });
    if (!modelData) {
      await Config.create({ company: req.user.company._id });
    }

    await Config.updateOne(
      {
        company: req.user.company._id,
      },
      {
        $set: {
          departments,
        },
      },
      {
        new: true,
      }
    )
      .then((result) => {
        return res.status(httpstatus.OK).json({
          message: "Departments updated successfully",
          departments: result.departments,
        });
      })
      .catch((err) => {
        return res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
          message: "Error in adding",
        });
      });
  },

  async dashboard(req, res) {
    let currentMeetingOnSite;
    let upComingMeetingsToday;
    let totalMeetingsDone = {};
    let totalRejectedMeetings = {};
    let employeeListSortedByMeetings = [];
    let body = {};

    const { custom, startTime, endTime } = req.query;
    let company;
    if (req.query.company) {
      company = mongoose.Types.ObjectId(req.query.company);
    } else {
      company = req.user.company._id;
    }

    const details = async () => {
      // curretn meetings on site
      const meetingsData = await Meeting.find({
        company: company,
        isInProgress: true,
      });
      currentMeetingOnSite = meetingsData.length;

      // today upcoming meetings
      const todayUpcomingMeetings = await Meeting.aggregate([
        {
          $match: {
            company: company,

            isInProgress: false,
            status: "upcoming",
            $expr: {
              $and: [
                {
                  $eq: [
                    { $dayOfMonth: "$meetingRequestTime" },
                    { $dayOfMonth: new Date() },
                  ],
                },
                {
                  $eq: [
                    { $month: "$meetingRequestTime" },
                    { $month: new Date() },
                  ],
                },
                {
                  $eq: [
                    { $year: "$meetingRequestTime" },
                    { $year: new Date() },
                  ],
                },
              ],
            },
          },
        },
      ]);

      upComingMeetingsToday = todayUpcomingMeetings.length;
      // total meetings done today

      if (custom === "true") {
        let departments = {};
        const meetings = await Meeting.find({
          company: company,
          status: "completed",
          meetingEndTime: {
            $gte: new Date(+startTime),
            $lt: new Date(+endTime),
          },
        });

        meetings.forEach(async (m) => {
          departments[m.employee.department] = 0;
        });

        meetings.forEach(async (m) => {
          departments[m.employee.department] += 1;
        });

        body.departmentWiseMeetings = departments;

        const totMeetDone = await Meeting.find({
          company: company,

          status: "completed",
          meetingEndTime: {
            $gte: new Date(+startTime),
            $lt: new Date(+endTime),
          },
        });

        const totRejDone = await Meeting.find({
          company: company,

          status: "rejected",
          meetingRejectedTime: {
            $gte: new Date(+startTime),
            $lt: new Date(+endTime),
          },
        });

        const totResDone = await Meeting.find({
          company: company,

          status: "reschedule",
          meetingRescheduledOn: {
            $gte: new Date(+startTime),
            $lt: new Date(+endTime),
          },
        });

        body.totalMeetingsDoneLength = totMeetDone.length;
        body.totalRejectedMeetingsDoneLength = totRejDone.length;
        body.totalRescheduledMeetingsDoneLength = totResDone.length;
      } else {
        let departments = {};
        const meetings = await Meeting.find({
          company: company,
          status: "completed",
        });

        meetings.forEach(async (m) => {
          departments[m.employee.department] = 0;
        });

        meetings.forEach(async (m) => {
          departments[m.employee.department] += 1;
        });

        body.departmentWiseMeetings = departments;

        const totMeetDone = await Meeting.find({
          company: company,

          status: "completed",
        });

        const totRejDone = await Meeting.find({
          company: company,

          status: "rejected",
        });

        const totResDone = await Meeting.find({
          company: company,

          status: "reschedule",
        });
        body.totalMeetingsDoneLength = totMeetDone.length;
        body.totalRejectedMeetingsDoneLength = totRejDone.length;
        body.totalRescheduledMeetingsDoneLength = totResDone.length;
      }

      const totMeetDoneToday = await Meeting.aggregate([
        {
          $match: {
            company: company,

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
            company: company,

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
            company: company,

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
            company: company,

            status: "completed",
            $expr: {
              $eq: [{ $year: "$meetingEndTime" }, { $year: new Date() }],
            },
          },
        },
      ]);

      totalMeetingsDone.thisYear = thisYearcompletedMeetings.length;

      // ----------------------------------------------------------------total rejected meetings-------------------------------------------------------------------------------------------------------------------------

      // total meetings rehjected today

      const totMeetRejToday = await Meeting.aggregate([
        {
          $match: {
            accepted: false,
            company: company,

            status: "rejected",
            $expr: {
              $and: [
                {
                  $eq: [
                    { $dayOfMonth: "$meetingRejectedTime" },
                    { $dayOfMonth: new Date() },
                  ],
                },
                {
                  $eq: [
                    { $month: "$meetingRejectedTime" },
                    { $month: new Date() },
                  ],
                },
                {
                  $eq: [
                    { $year: "$meetingRejectedTime" },
                    { $year: new Date() },
                  ],
                },
              ],
            },
          },
        },
      ]);

      totalRejectedMeetings.today = totMeetRejToday.length;

      // this week total meetings

      const thisWeekRejMeetings = await Meeting.aggregate([
        {
          $project: {
            company: company,

            status: "rejected",
            meetingRejectedTime: {
              $dateFromParts: {
                year: { $year: new Date() },
                month: { $month: "$meetingRejectedTime" },
                day: { $dayOfMonth: "$meetingRejectedTime" },
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $eq: [{ $week: "$meetingRejectedTime" }, { $week: new Date() }],
            },
          },
        },
      ]);

      totalRejectedMeetings.thisWeek = thisWeekRejMeetings.length;

      // this month total meetings

      const thisMonthRejMeetings = await Meeting.aggregate([
        {
          $match: {
            accepted: false,
            company: company,

            status: "rejected",
            $expr: {
              $and: [
                {
                  $eq: [
                    { $month: "$meetingRejectedTime" },
                    { $month: new Date() },
                  ],
                },
                {
                  $eq: [
                    { $year: "$meetingRejectedTime" },
                    { $year: new Date() },
                  ],
                },
              ],
            },
          },
        },
      ]);

      totalRejectedMeetings.thisMonth = thisMonthRejMeetings.length;

      // this year meetings

      const thisYearRejMeetings = await Meeting.aggregate([
        {
          $match: {
            accepted: false,
            company: company,

            status: "rejected",
            $expr: {
              $eq: [{ $year: "$meetingRejectedTime" }, { $year: new Date() }],
            },
          },
        },
      ]);

      totalRejectedMeetings.thisYear = thisYearRejMeetings.length;

      let groupedMeetingsData = await Meeting.aggregate([
        {
          $match: { company: company, status: "completed" },
        },
        {
          $group: {
            _id: "$employee._id",
            meetingData: { $first: "$$CURRENT" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },

        {
          $lookup: {
            from: "meetings",
            localField: "_id",
            foreignField: "_id",
            as: "Meeting data",
          },
        },
      ]);

      groupedMeetingsData.forEach(async (element) => {
        let data = await Employee.findOne({
          _id: element._id,
        });
        if (data) {
          element.emp = {
            name: data.name,
            email: data.email,
          };
          element["empId"] = element["_id"]; //rename field _id to empId after assigning new value delete old key
          delete element["_id"];
        } else {
          element.emp = {
            name: element.meetingData.employee.name,
            email: element.meetingData.employee.email,
          };
          element["empId"] = element["_id"]; //rename field _id to empId after assigning new value delete old key
          delete element["_id"];
        }
      });

      // no of visitor

      const noOfVisitors = await Visitor.find({
        company: company,
      }).count();
      const noOfEmployees = await Employee.find({
        company: company,
      }).count();

      body = {
        ...body,
        currentMeetingsOnSite: currentMeetingOnSite,
        upComingMeetingsToday: upComingMeetingsToday,
        totalMeetingsDone: totalMeetingsDone,
        totalRejectedMeetings: totalRejectedMeetings,
        totalVisitors: noOfVisitors,
        totalEmployees: noOfEmployees,
        employeeListSortedByMeetings: groupedMeetingsData,
      };

      // console.log(body.groupedMeetingsData);
    };

    details()
      .then(() => {
        return res
          .status(httpstatus.OK)
          .json({ message: "Dashboard data of admin", ...body });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(httpstatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error ", err });
      });
  },
};
