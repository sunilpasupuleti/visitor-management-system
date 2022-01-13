const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const httpstatus = require("http-status-codes");
const axios = require("axios");
const firebaseAdmin = require("firebase-admin");
const adminModels = require("../models/adminModels");
const employeeModels = require("../models/employeeModels");
const visitorModels = require("../models/visitorModels");

dotenv.config();

module.exports = {
  VerifyToken: async (req, res, next) => {
    const headerToken = req.headers.authorization;
    if (!headerToken) {
      return res
        .status(httpstatus.FORBIDDEN)
        .json({ message: "No token provided to access" });
    }

    if (headerToken && headerToken.split(" ")[0] !== "Bearer") {
      return res
        .status(httpstatus.FORBIDDEN)
        .json({ message: "Invalid token", token: null });
    }

    const token = headerToken.split(" ")[1];

    firebaseAdmin
      .auth()
      .verifyIdToken(token)
      .then(async (data) => {
        let userData;
        if (data.firebase.sign_in_provider === "password") {
          var adminData = await adminModels
            .findOne({ email: data.email })
            .populate("company");
          var employeeData = await employeeModels
            .findOne({
              email: data.email,
            })
            .populate("company");
          if (adminData) {
            userData = adminData;
          } else if (employeeData) {
            userData = employeeData;
          }
        }
        req.user = userData;
        next();
      })
      .catch(() => {
        return res.status(httpstatus.UNAUTHORIZED).json({
          message: "Token has expired please login again",
          token: "false",
        });
      });
  },

  VerifyVisitorToken: async (req, res, next) => {
    // console.log(rp);
    if (!req.headers.authorization) {
      return res
        .status(httpstatus.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(httpstatus.FORBIDDEN)
        .json({ message: "No token provided to access" });
    }

    return jwt.verify(token, process.env.SECRETS, (err, decoded) => {
      if (err) {
        if (err.expiredAt < new Date()) {
          return res.status(httpstatus.INTERNAL_SERVER_ERROR).json({
            message: "Token has expired please login again",
            token: false,
          });
        }
        next();
      }
      req.user = decoded.data; //data variable was coming from jwt.signin
      next();
    });
  },
};
