const httpstatus = require("http-status-codes");
const helper = require("../helpers/helpers");
const moment = require("moment");
const CompanyModels = require("../models/companyModels");
const helpers = require("../helpers/helpers");
const employeeModels = require("../models/employeeModels");
const visitorModels = require("../models/visitorModels");
const meetingModel = require("../models/meetingModel");
const configModels = require("../models/configModels");
const adminModels = require("../models/adminModels");
const firebase = require("firebase-admin");
const qrcode = require("qrcode");

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
    if (!value.name || !value.address || !value.expiresAt || !value.flow) {
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
        if (value.flow === "qrcode") {
          let url =
            process.env.FRONTEND_URL +
            "/visitor/register/?company_id=" +
            data._id;
          qrcode.toDataURL(url, async (err, src) => {
            if (err) {
              return res.status(httpstatus.CONFLICT).json({
                message: "Error im generating qr code",
              });
            }

            await CompanyModels.findOneAndUpdate(
              {
                _id: data._id,
              },
              {
                $set: {
                  qrCode: src,
                },
              },
              {
                new: true,
              }
            )
              .then((result) => {
                return res.status(httpstatus.OK).json({
                  message: "Company added successfully",
                  data: result,
                });
              })
              .catch((err) => {
                return res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
                  message: err,
                });
              });
          });
        } else {
          return res.status(httpstatus.OK).json({
            message: "Company added successfully",
            data,
          });
        }
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
        const db = firebase.firestore();
        const collection = db.collection("companyIds");
        const docName = collection.doc(userRecord.uid);
        await docName.set({
          companyId: value.company._id,
          companyName: value.company.name,
        });
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
      .catch((err) => {
        console.log(err);
      });
  },

  async updateCompany(req, res) {
    const value = req.body;
    if (
      !value.name ||
      !value.address ||
      !value.expiresAt ||
      !value.Id ||
      !value.flow
    ) {
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

    let company = await CompanyModels.findOne({
      _id: req.body.Id,
    });

    if (!company) {
      return res.status(httpstatus.CONFLICT).json({
        message: "No company exists exists",
      });
    }

    let changedFlow = value.flow;
    let presentFlow = company.flow;

    let toUpdateData = {
      ...req.body,
      name: helper.uppercase(req.body.name),
      qrCode: company.qrCode,
    };

    if (changedFlow !== presentFlow) {
      if (changedFlow === "qrcode") {
        let url =
          process.env.FRONTEND_URL +
          "/visitor/register/?company_id=" +
          company._id;
        qrcode.toDataURL(url, async (err, src) => {
          if (err) {
            return res.status(httpstatus.CONFLICT).json({
              message: "Error in generating qr code",
            });
          }
          toUpdateData.qrCode = src;
          await CompanyModels.findOneAndUpdate(
            {
              _id: req.body.Id,
            },
            {
              $set: toUpdateData,
            },
            { new: true }
          );
        });
      } else {
        toUpdateData.qrCode = null;
      }
    }

    await CompanyModels.findOneAndUpdate(
      {
        _id: req.body.Id,
      },
      {
        $set: toUpdateData,
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
          const db = firebase.firestore();
          await db.collection("companyIds").doc(element.uid).delete();
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

      const db = firebase.firestore();
      await db.collection("companyIds").doc(details.uid).delete();

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
