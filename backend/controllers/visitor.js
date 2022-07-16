const httpstatus = require("http-status-codes");
const Visitor = require("../models/visitorModels");
const Employee = require("../models/employeeModels");

const Meeting = require("../models/meetingModel");
const mongoose = require("mongoose");
const helper = require("../helpers/helpers");
const firebase = require("firebase-admin");
const jwt = require("jsonwebtoken");
const companyModels = require("../models/companyModels");
const multer = require("multer");

function returnUrl(tempId, mobile, otp) {
  let path =
    "https://api.msg91.com/api/v5/otp?template_id=" +
    tempId +
    "&mobile=" +
    mobile +
    "&authkey=" +
    process.env.MSG91_AUTHKEY +
    "&otp=" +
    otp;
  return path;
}

module.exports = {
  async searchVisitorNumber(req, res) {
    var phoneno = /^91[6-9]\d{9}$/;

    if (!req.query.phone.match(phoneno)) {
      return res.status(httpstatus.CONFLICT).json({
        message:
          "Invalid phone number provided, provide valid number ex. 91 9876567890",
      });
    }

    await Visitor.findOne({
      phone: req.query.phone,
    })
      .populate("company")
      .then(async (result) => {
        if (!result) {
          var otp = Math.floor(1000 + Math.random() * 9000);
          let otpUrl = returnUrl(
            process.env.MSG91_TEMPLATEID,
            req.query.phone,
            otp
          );
          var values = {
            COMPANY_NAME: "VMS",
            WEBSITE_URL: "vms.webwizard.in",
          };
          const axios = require("axios");
          axios
            .post(otpUrl, JSON.stringify(values))
            .then((response) => {
              return res.status(httpstatus.OK).json({
                message: "Otp was sent successfully  : ",
                otp,
                visitor: result,
              });
            })
            .catch((err) => {
              return res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
                message: "Error : in sending otp",
                err,
              });
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
    var phoneno = /^91[6-9]\d{9}$/;

    if (!req.query.phone.match(phoneno)) {
      return res.status(httpstatus.CONFLICT).json({
        message: "Invalid phone number provide with ex. 919876567890",
      });
    }

    var otp = Math.floor(1000 + Math.random() * 9000);
    let otpUrl = returnUrl(process.env.MSG91_TEMPLATEID, req.query.phone, otp);
    var values = {
      COMPANY_NAME: "VMS",
      WEBSITE_URL: "vms.webwizard.in",
    };
    const axios = require("axios");
    axios
      .post(otpUrl, JSON.stringify(values))
      .then((response) => {
        return res.status(httpstatus.OK).json({
          message: "Otp was sent successfully  : ",
          otp,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
          message: "Error : in sending otp",
          err,
        });
      });
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

    var phoneno = /^91[6-9]\d{9}$/;

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

    if (
      companyExists &&
      companyExists.flow &&
      companyExists.flow !== "normal"
    ) {
      return res
        .status(httpstatus.NOT_ACCEPTABLE)
        .json({ message: "Flow mismatch" });
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
      role: "visitor",
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

  async saveVisitorWeb(req, res) {
    const bucket = firebase.storage().bucket();
    const upload = multer({
      storage: multer.memoryStorage(),
    }).single("doc-proof");

    upload(req, res, async (err) => {
      // for uploading document proof

      const { name, company, address, selfie, idType, phone, companyName } =
        req.body;
      if (
        !name ||
        !company ||
        !companyName ||
        !phone ||
        !address ||
        !selfie ||
        !idType
      ) {
        return res
          .status(httpstatus.CONFLICT)
          .json({ message: "All fields required" });
      }

      if (!req.file) {
        return res
          .status(httpstatus.CONFLICT)
          .json({ message: "File required" });
      }

      var phoneno = /^91[6-9]\d{9}$/;

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
      if (company.length < 24) {
        return res.status(httpstatus.NOT_ACCEPTABLE).json({
          message: "Company Id is invalid : ",
        });
      }

      var companyExists = await companyModels.findOne({
        _id: company,
      });

      if (!companyExists) {
        return res.status(httpstatus.NOT_ACCEPTABLE).json({
          message: "Company Id is invalid : ",
        });
      }

      if (
        companyExists &&
        companyExists.flow &&
        companyExists.flow !== "qrcode"
      ) {
        return res
          .status(httpstatus.NOT_ACCEPTABLE)
          .json({ message: "Flow mismatch" });
      }

      const visitorDetails = {
        name: helper.capitalize(req.body.name),
        phone: req.body.phone,
        address,
        idType,
        company,
        companyName,
        role: "visitor",
      };

      let documentProof = req.file;
      const docFileName = +new Date() + "-" + documentProof.originalname;
      const documentBlob = bucket.file("document-proofs/" + docFileName);
      const documentBlobWriter = documentBlob
        .createWriteStream({
          public: true,
        })
        .end(documentProof.buffer);

      documentBlobWriter.on("error", (err) => {
        console.log(err.stack, "error in document uploading");
        return res.status(httpstatus.CONFLICT).json({
          message: "Sorry error occured while uploading the files.",
        });
      });

      documentBlobWriter.on("finish", async () => {
        console.log(documentBlob.publicUrl());
        visitorDetails.idLink = documentBlob.publicUrl();
        // for uploading selfie

        const selfieFileName = +new Date() + ".jpeg";
        const selfieBlob = bucket.file("selfie-images/" + selfieFileName);
        const selfieBlobWriter = selfieBlob
          .createWriteStream({
            public: true,
            contentType: "image/jpeg",
          })
          .end(Buffer.from(selfie, "base64"));

        selfieBlobWriter.on("error", (err) => {
          console.log(err.stack, "error in document uploading");
          return res.status(httpstatus.CONFLICT).json({
            message: "Sorry error occured while uploading the files.",
          });
        });

        selfieBlobWriter.on("finish", async () => {
          console.log(selfieBlob.publicUrl());
          visitorDetails.selfieLink = selfieBlob.publicUrl();

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
        });
      });

      // console.log(selfie);
      // console.log(Buffer.from(selfie, "base64"));
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
