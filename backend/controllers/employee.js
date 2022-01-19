const httpstatus = require("http-status-codes");
const Employee = require("../models/employeeModels");
const Meeting = require("../models/meetingModel");
const Visitor = require("../models/visitorModels");

const helper = require("../helpers/helpers");

const mongoose = require("mongoose");
const moment = require("moment");
moment.suppressDeprecationWarnings = true;

async function editMeetings(body, compId) {
  let meetings = await Meeting.find({ company: compId });
  meetings.forEach(async (m) => {
    const body = {
      name: helper.capitalize(body.name),
      email: body.email,
      phone: body.phone,
      department: body.department,
      designation: helper.capitalize(body.designation),
      image: body.image,
    };

    await Meeting.findOneAndUpdate(
      {
        _id: m._id,
      },
      {
        $set: {
          employee: { ...body },
        },
      },
      { new: true }
    ).then((result) => {});
    console.log("iteration ");
  });
}

const firebaseAdmin = require("firebase-admin");
module.exports = {
  async saveFcmToken(req, res) {
    const { uid } = req.body;
    if (!uid) {
      console.log("nothing");
      res.status(httpstatus.CONFLICT).json({ message: "All fields required" });
      return;
    }

    if (req.body.fcmToken) {
      await Employee.updateOne(
        { uid: uid },
        {
          $set: {
            fcmToken: req.body.fcmToken,
          },
        }
      );
      return res.status(httpstatus.OK).json({
        message: "Updated fcm token : ",
      });
    } else {
      return res.status(httpstatus.CONFLICT).json({
        message: "Please provide fcm token : ",
      });
    }
  },

  async getEmployees(req, res) {
    await Employee.find({
      company: req.user.company._id,
    })
      .then((result) => {
        res.status(httpstatus.OK).json({
          message: "All Employees : ",
          employees: result,
        });
      })
      .catch((err) => {
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },

  async getVisitors(req, res) {
    await Visitor.find({
      company: req.user.company._id,
    })
      .then((result) => {
        res.status(httpstatus.OK).json({
          message: "All visitors : ",
          visitors: result,
        });
      })
      .catch((err) => {
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },

  async getVisitorData(req, res) {
    let visitorId = req.query.visitorId.toString();
    let employeeId = req.user._id.toString();

    if (!visitorId || !employeeId) {
      return res
        .status(httpstatus.CONFLICT)
        .json({ message: "No visitor or employee Id provided" });
    }
    let completedMeetings = [];
    let rejectedMeetings = [];
    let rescheduledMeetings = [];
    const details = async () => {
      completedMeetings = await Meeting.find({
        "employee._id": employeeId,
        "visitor._id": visitorId,
        status: "completed",
      });

      rejectedMeetings = await Meeting.find({
        "employee._id": employeeId,
        "visitor._id": visitorId,
        status: "rejected",
      });

      rescheduledMeetings = await Meeting.find({
        "employee._id": employeeId,
        "visitor._id": visitorId,
        status: "reschedule",
      });
    };

    details()
      .then((result) => {
        res.status(httpstatus.OK).json({
          message: "Visitor data : ",
          completedMeetings,
          rescheduledMeetings,
          rejectedMeetings,
        });
      })
      .catch((err) => {
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },

  async getDashboard(req, res) {
    let rescheduled = [];
    let rejected = [];
    let inProgress = [];
    let upcoming = [];
    let completed = [];
    let mostVisitedVisitor = {};
    let longestMeeting;
    let shortestMeeting;
    let totalMeetingsDoneToday;
    let empId = req.user._id.toString();
    const details = async () => {
      let mostVisitedVisitors = await Meeting.aggregate([
        {
          $match: {
            "employee._id": empId,
            status: "completed",
          },
        },
        {
          $group: { _id: "$visitor._id", count: { $sum: 1 } },
        },
        {
          $sort: { count: -1 },
        },
      ]);
      if (mostVisitedVisitors.length > 0) {
        const max = mostVisitedVisitors.reduce((prev, current) =>
          prev.count > current.count ? prev : current
        );

        let mostVisitor = await Visitor.findOne({
          _id: max._id,
        });
        max.visitor = mostVisitor;
        mostVisitedVisitor = max;
      }
      let meetings = await Meeting.find({
        "employee._id": empId,
        status: "completed",
      });

      meetings.map((e, index) => {
        let raisedTime = moment(e.meetingRaisedTime).format(
          "MMM DD , YYYY hh:mm:ss"
        );
        let endTime = moment(e.meetingEndTime).format("MMM DD , YYYY hh:mm:ss");
        let diff = moment(endTime).diff(raisedTime);
        meetings[index].duration = moment(diff).format("hh:mm:ss");
      });

      longestMeeting = meetings.reduce((prev, current) => {
        return prev.duration > current.duration ? prev : current;
      });

      shortestMeeting = meetings.reduce((prev, current) => {
        return prev.duration < current.duration ? prev : current;
      });

      const totalMeetingsDoneToday = await Meeting.aggregate([
        {
          $match: {
            "employee._id": empId,
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

      await Meeting.find({
        "employee._id": empId,
        status: "accepted",
      }).then((data) => {
        inProgress = data;
      });

      await Meeting.find({
        "employee._id": empId,

        status: "upcoming",
      }).then((data) => {
        upcoming = data;
      });

      await Meeting.find({
        "employee._id": empId,

        status: "completed",
      }).then((data) => {
        completed = data;
      });

      await Meeting.find({
        "employee._id": empId,

        status: "rejected",
      }).then((data) => {
        rejected = data;
      });

      await Meeting.find({
        "employee._id": empId,
        status: "reschedule",
      }).then((data) => {
        rescheduled = data;
      });
    };

    details()
      .then(() => {
        res.status(httpstatus.OK).json({
          message: "Dahsboard data : ",
          rescheduled,
          inProgress,
          upcoming,
          rejected,
          completed,
          mostVisitedVisitor,
          longestMeeting,
          shortestMeeting,
          totalMeetingsDoneToday,
        });
      })
      .catch((err) => {
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },

  async getHomePage(req, res) {
    let requestMeetings = [];
    let todayCompletedMeetings = [];
    let inProgressMeetings = [];
    let empId = req.user._id.toString();
    const details = async () => {
      await Meeting.find({
        "employee._id": empId,
        status: "upcoming",
      }).then((data) => {
        requestMeetings = data;
      });

      await Meeting.find({
        "employee._id": empId,
        status: "accepted",
      }).then((data) => {
        inProgressMeetings = data;
      });

      const totMeetDoneToday = await Meeting.aggregate([
        {
          $match: {
            "employee._id": empId,
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

      todayCompletedMeetings = totMeetDoneToday;
    };

    details()
      .then(() => {
        res.status(httpstatus.OK).json({
          message: "Home page data : ",
          requestMeetings,
          todayCompletedMeetings,
          inProgressMeetings,
          employee: req.user,
        });
      })
      .catch((err) => {
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },

  async addEmployee(req, res) {
    const {
      name,
      phone,
      email,
      department,
      designation,
      uid,
      password,
      image,
    } = req.body;

    if (
      !name ||
      !phone ||
      !email ||
      !department ||
      !designation ||
      !password ||
      !image
    ) {
      return res.status(httpstatus.BAD_REQUEST).json({
        message: "All fields are required",
      });
    }

    const body = {
      name: helper.capitalize(name),
      phone,
      password,
      email: helper.lowercase(email),
      department,
      image,
      designation: helper.capitalize(designation),
      company: req.user.company._id,
    };

    const exists = await Employee.findOne({
      email: helper.lowercase(email),
    });

    if (exists) {
      await firebaseAdmin
        .storage()
        .bucket()
        .file("profile-images/" + body.image.name)
        .delete();

      return res.status(httpstatus.CONFLICT).json({
        message: "Employee already exists with the provided email-id ! ",
      });
    }

    firebaseAdmin
      .auth()
      .createUser({
        email: helper.lowercase(email),
        password: password,
      })
      .then(async function (userRecord) {
        body.uid = userRecord.uid;
        await Employee.create(body)
          .then((result) => {
            res.status(httpstatus.OK).json({
              message: "Employee added successfully : ",
              employee: result,
            });
          })
          .catch((err) => {
            return res
              .status(httpstatus.INTERNAL_SERVER_ERROR)
              .json({ message: err });
          });
      })
      .catch((err) => {
        return res
          .status(httpstatus.INTERNAL_SERVER_ERROR)
          .json({ message: err.message });
      });
  },

  async editEmployee(req, res) {
    const {
      name,
      phone,
      email,
      uid,
      password,
      department,
      designation,
      empId,
      changedEmpImage,
    } = req.body;

    const exists = await Employee.findOne({
      _id: { $ne: empId },
      email: helper.lowercase(email),
    });

    if (exists) {
      if (changedEmpImage) {
        await firebaseAdmin
          .storage()
          .bucket()
          .file("profile-images/" + req.body.image.name)
          .delete();
      }

      return res.status(httpstatus.CONFLICT).json({
        message: "Employee already exists with the provided email-id ! ",
      });
    }

    let details = await Employee.findOne({
      _id: empId,
    });
    let image;
    if (changedEmpImage) {
      await firebaseAdmin
        .storage()
        .bucket()
        .file("profile-images/" + details.image.name)
        .delete();
      image = req.body.image;
    } else {
      image = details.image;
    }

    const body = {
      name: helper.capitalize(name),
      email,
      phone,
      password,
      department,
      designation: helper.capitalize(designation),
      image,
    };

    let updateBody;
    if (details.password !== password || details.email !== email) {
      updateBody = {
        email: email,
        password: password,
      };

      await firebaseAdmin
        .auth()
        .updateUser(details.uid, updateBody)
        .then(async (userRecord) => {
          await Employee.findOneAndUpdate(
            {
              _id: empId,
            },
            {
              $set: {
                ...body,
              },
            },
            { new: true }
          )
            .then((result) => {
              res.status(httpstatus.OK).json({
                message: "Employee updated successfully : ",
                employee: result,
              });
            })
            .catch((err) => {
              res
                .status(httpstatus.INTERNAL_SERVER_ERROR)
                .json({ message: err });
            });
        });
    } else {
      await Employee.findOneAndUpdate(
        {
          _id: empId,
        },
        {
          $set: {
            ...body,
          },
        },
        { new: true }
      )
        .then((result) => {
          res.status(httpstatus.OK).json({
            message: "Employee updated successfully : ",
            employee: result,
          });
          editMeetings(req.body, req.user.company._id);
        })
        .catch((err) => {
          res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
        });
    }
  },

  async deleteEmployee(req, res) {
    const { employeeId, uid } = req.query;
    if (employeeId.length !== 24) {
      return res.status(httpstatus.BAD_REQUEST).json({
        message: "Invalid Id or No id passed",
      });
    }

    let details = await Employee.findOne({ _id: employeeId });

    firebaseAdmin
      .auth()
      .deleteUser(uid)
      .then(async () => {
        await firebaseAdmin
          .storage()
          .bucket()
          .file("profile-images/" + details.image.name)
          .delete();

        await Employee.findOneAndDelete({
          _id: employeeId,
        }).then((result) => {
          res.status(httpstatus.OK).json({
            message: "Employee Deleted successfully : ",
            employee: result,
          });
        });
      });
  },

  async updateVacationMode(req, res) {
    console.log(req.user._id);
    let mode = req.query.mode;
    if (mode !== "on" && mode !== "off") {
      return res.status(httpstatus.OK).json({
        message: "Please  provide mode on or off: ",
      });
    }
    let result;
    let status;
    if (mode === "on") {
      result = true;
      status = "disabled";
    } else if (mode === "off") {
      result = false;
      status = "enabled";
    }

    await Employee.updateOne(
      {
        _id: req.user._id,
      },
      {
        $set: {
          status: status,
          isOnVacationMode: result,
        },
      }
    )
      .then((result) => {
        return res.status(httpstatus.OK).json({
          message: "Mode changed to  : " + mode,
        });
      })
      .catch((err) => {
        return res
          .status(httpstatus.INTERNAL_SERVER_ERROR)
          .json({ message: err });
      });
  },

  async getEmployeeDetails(req, res) {
    let { employeeId } = req.query;
    let meetings;
    let employee;
    let currentMeetingsOnSite;
    let upComingMeetings;
    let totalMeetingsDone = {};
    let visitors;
    let body = {};

    const { custom, startTime, endTime } = req.query;

    if (!employeeId || employeeId.length !== 24) {
      return res
        .status(httpstatus.CONFLICT)
        .json({ message: "No Employee Id or Invalid Employee Id" });
    }

    // employeeId = mongoose.Types.ObjectId(employeeId);

    const details = async () => {
      if (custom === "true") {
        const totMeetDone = await Meeting.find({
          status: "completed",
          "employee._id": employeeId,
          meetingEndTime: {
            $gte: new Date(+startTime),
            $lt: new Date(+endTime),
          },
        });

        const totRejDone = await Meeting.find({
          status: "rejected",
          "employee._id": employeeId,
          meetingRejectedTime: {
            $gte: new Date(+startTime),
            $lt: new Date(+endTime),
          },
        });

        const totResDone = await Meeting.find({
          status: "reschedule",
          "employee._id": employeeId,
          meetingRescheduledOn: {
            $gte: new Date(+startTime),
            $lt: new Date(+endTime),
          },
        });

        meetings = await Meeting.find({
          "employee._id": employeeId,
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
          "employee._id": employeeId,
        });

        const totRejDone = await Meeting.find({
          status: "rejected",
          "employee._id": employeeId,
        });

        const totResDone = await Meeting.find({
          status: "reschedule",
          "employee._id": employeeId,
        });

        meetings = await Meeting.find({
          "employee._id": employeeId,
        });

        body.totalMeetingsDoneLength = totMeetDone.length;
        body.totalRejectedMeetingsDoneLength = totRejDone.length;
        body.totalRescheduledMeetingsDoneLength = totResDone.length;
      }

      currentMeetingsOnSite = await Meeting.find({
        "employee._id": employeeId,
        isInProgress: true,
      }).count();

      upComingMeetings = await Meeting.find({
        "employee._id": employeeId,
        isInProgress: false,
        status: 1,
      }).count();

      let employeeObjId = mongoose.Types.ObjectId(employeeId);

      const totMeetDoneToday = await Meeting.aggregate([
        {
          $match: {
            "employee._id": employeeId,
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
            "employee._id": employeeId,
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
            "employee._id": employeeId,
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
            "employee._id": employeeId,
            status: "completed",
            $expr: {
              $eq: [{ $year: "$meetingEndTime" }, { $year: new Date() }],
            },
          },
        },
      ]);

      totalMeetingsDone.thisYear = thisYearcompletedMeetings.length;

      employee = await Employee.findOne({
        _id: employeeId,
      });

      visitors = await Visitor.find({
        company: req.user.company._id,
      })
        .select({
          name: 1,
        })
        .sort({ name: 1 });

      let meetingsByMonthAndYear = await Meeting.aggregate([
        {
          $match: {
            "employee._id": employeeId,
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
        employee,
        meetings,
        currentMeetingsOnSite,
        upComingMeetings,
        totalMeetingsDone,
        meetingsByMonthAndYear,
        visitors,
      };
    };

    details()
      .then(() => {
        res.status(httpstatus.OK).json({
          message: "Employee by id",
          ...body,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(httpstatus.INTERNAL_SERVER_ERROR).json({ message: err });
      });
  },
};
