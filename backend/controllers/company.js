const httpstatus = require("http-status-codes");
const helper = require("../helpers/helpers");
const moment = require("moment");
const CompanyModels = require("../models/companyModels");
var validator = require("email-validator");
const helpers = require("../helpers/helpers");
const employeeModels = require("../models/employeeModels");
const visitorModels = require("../models/visitorModels");
const meetingModel = require("../models/meetingModel");
const configModels = require("../models/configModels");
const adminModels = require("../models/adminModels");
const firebase = require("firebase-admin");

module.exports = {
  async getCompany(req, res) {
    const data = await CompanyModels.findOne({
      _id: req.query.companyId,
    });

    return res
      .status(httpstatus.OK)
      .json({ message: "Company Details", company: data });
  },

  async getCompanies(req, res) {
    const data = await CompanyModels.find({}).sort({ createdAt: -1 });

    return res
      .status(httpstatus.OK)
      .json({ message: "Companies Details", companies: data });
  },

  async getUsers(req, res) {
    const data = await adminModels
      .find({
        _id: { $ne: req.user._id },
      })
      .populate("company")
      .sort({ createdAt: -1 });

    return res
      .status(httpstatus.OK)
      .json({ message: "Users Details", users: data });
  },

  async createCompany(req, res) {
    const value = req.body;
    if (!value.name || !value.address || !value.expiresAt) {
      return res.status(httpstatus.CONFLICT).json({
        message: "All Fields Required",
      });
    }
    const exists = await CompanyModels.findOne({
      name: helpers.uppercase(req.body.name),
    });

    if (exists) {
      return res.status(httpstatus.CONFLICT).json({
        message: "Company with name already exists",
      });
    }

    await CompanyModels.create({
      ...req.body,
      name: helper.uppercase(req.body.name),
    })
      .then((data) => {
        return res
          .status(httpstatus.OK)
          .json({ message: "Company added successfully", data });
      })
      .catch((err) => {
        return res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
          message: err,
        });
      });
  },

  async createUser(req, res) {
    const value = req.body;
    if (!value.name || !value.email || !value.password || !value.company) {
      return res.status(httpstatus.CONFLICT).json({
        message: "All Fields Required",
      });
    }
    const exists = await adminModels.findOne({
      $or: [
        { email: helpers.lowercase(value.email) },
        { company: value.company },
      ],
    });

    if (exists) {
      return res.status(httpstatus.CONFLICT).json({
        message: "User already exists for the company you provided",
      });
    }

    let userBody = {
      email: helper.lowercase(value.email),
      emailVerified: true,
      password: value.password,
      displayName: value.name,
      disabled: false,
    };
    firebase
      .auth()
      .createUser(userBody)
      .then(async function (userRecord) {
        delete userBody.disabled;
        delete userBody.emailVerified;
        await adminModels
          .create({
            ...userBody,
            uid: userRecord.uid,
            role: "Admin",
            name: userBody.displayName,
            company: value.company,
          })
          .then((data) => {
            return res
              .status(httpstatus.OK)
              .json({ message: "User added successfully", data });
          })
          .catch((err) => {
            return res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
              message: err,
            });
          });
      })
      .catch((err) => {});
  },

  async updateCompany(req, res) {
    const value = req.body;
    if (!value.name || !value.address || !value.expiresAt || !value.Id) {
      return res.status(httpstatus.CONFLICT).json({
        message: "All Fields Required",
      });
    }
    const exists = await CompanyModels.findOne({
      _id: { $ne: req.body.Id },
      name: helpers.uppercase(req.body.name),
    });

    if (exists) {
      return res.status(httpstatus.CONFLICT).json({
        message: "Company with name already exists",
      });
    }

    await CompanyModels.findOneAndUpdate(
      {
        _id: req.body.Id,
      },
      {
        $set: {
          ...req.body,
          name: helper.uppercase(req.body.name),
        },
      },
      { new: true }
    )

      .then((data) => {
        return res
          .status(httpstatus.OK)
          .json({ message: "Company details updated successfully", data });
      })
      .catch((err) => {
        return res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
          message: err,
        });
      });
  },

  async updateUser(req, res) {
    const value = req.body;
    if (!value.name || !value.email || !value.password || !value.company) {
      return res.status(httpstatus.CONFLICT).json({
        message: "All Fields Required",
      });
    }
    const exists = await adminModels.findOne({
      _id: { $ne: value.Id },
      $or: [
        { email: helpers.lowercase(value.email) },
        { company: value.company },
      ],
    });

    if (exists) {
      return res.status(httpstatus.CONFLICT).json({
        message: "User already exists for the company you provided",
      });
    }

    var details = await adminModels.findOne({ _id: value.Id });
    if (
      details.email !== helpers.lowercase(value.email) ||
      details.password !== value.password
    ) {
      firebase
        .auth()
        .updateUser(details.uid, {
          email: helpers.lowercase(value.email),
          password: value.password,
        })
        .then(async (userRecord) => {
          await adminModels
            .findOneAndUpdate(
              {
                _id: value.Id,
              },
              {
                $set: {
                  ...value,
                },
              },
              { new: true }
            )
            .then((result) => {
              res.status(httpstatus.OK).json({
                message: "User updated successfully : ",
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
      await adminModels
        .findOneAndUpdate(
          {
            _id: value.Id,
          },
          {
            $set: {
              ...req.body,
            },
          },
          { new: true }
        )

        .then((data) => {
          return res
            .status(httpstatus.OK)
            .json({ message: "User updated successfully", data });
        })
        .catch((err) => {
          return res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
            message: err,
          });
        });
    }
  },

  async deleteCompany(req, res) {
    const details = await CompanyModels.findOne({
      _id: req.query.id,
    });

    const update = async () => {
      await employeeModels.deleteMany({
        company: details._id,
      });

      await visitorModels.deleteMany({
        company: details._id,
      });

      await meetingModel.deleteMany({
        company: details._id,
      });

      await configModels.deleteMany({
        company: details._id,
      });

      const users = await adminModels.find({
        company: details._id,
      });
      if (users && users.length > 0) {
        users.forEach(async (element) => {
          firebase
            .auth()
            .deleteUser(element.uid)
            .then(async () => {
              await adminModels
                .findOneAndDelete({
                  _id: element._id,
                })
                .then((result) => {});
            });
        });
      }

      await CompanyModels.findOneAndDelete({
        _id: req.query.id,
      });
    };

    update()
      .then((data) => {
        return res
          .status(httpstatus.OK)
          .json({ message: "Company and data successfully", data });
      })
      .catch((err) => {
        return res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
          message: err,
        });
      });
  },

  async deleteUser(req, res) {
    const details = await adminModels.findOne({
      _id: req.query.id,
    });

    const update = async () => {
      await employeeModels.deleteMany({
        company: details.company._id,
      });

      await visitorModels.deleteMany({
        company: details.company._id,
      });

      await meetingModel.deleteMany({
        company: details.company._id,
      });

      await configModels.deleteMany({
        company: details.company._id,
      });

      firebase
        .auth()
        .deleteUser(details.uid)
        .then(async () => {
          await adminModels
            .findOneAndDelete({
              _id: details._id,
            })
            .then((result) => {});
        });
    };

    update()
      .then((data) => {
        return res
          .status(httpstatus.OK)
          .json({ message: "User and data successfully", data });
      })
      .catch((err) => {
        return res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
          message: err,
        });
      });
  },
};
