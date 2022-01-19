const httpstatus = require("http-status-codes");
const Employee = require("../models/employeeModels");
const helper = require("../helpers/helpers");
const firebaseAdmin = require("firebase-admin");
const mongoose = require("mongoose");
const adminModels = require("../models/adminModels");
const jwt = require("jsonwebtoken");
const moment = require("moment");

module.exports = {
  async adminLogin(req, res) {
    const { email, uid } = req.body;
    console.log(req.body);
    console.log("----------------");
    if (!uid || !email) {
      console.log("nothing");
      res.status(httpstatus.CONFLICT).json({ message: "All fields required" });
      return;
    }
    delete req.body.emailVerified;
    let result = await adminModels.findOne({ uid: uid }).populate("company");
    if (result) {
      const token = jwt.sign({ data: result }, process.env.SECRETS, {
        expiresIn: "1h",
      });
      let isMasterAdmin;
      if (result.role === "Super Admin") {
        isMasterAdmin = true;
      }

      if (req.body.fcmToken) {
        await adminModels.updateOne(
          { uid: uid },
          {
            $set: {
              fcmToken: req.body.fcmToken,
            },
          }
        );
      }

      return res.status(httpstatus.OK).json({
        message: "Admin details : ",
        admin: result,
        token,
        isMasterAdmin,
      });
    }
  },
};
