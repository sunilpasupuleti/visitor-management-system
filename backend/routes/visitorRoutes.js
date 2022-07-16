const express = require("express");
const router = express.Router();

const AuthHelper = require("../helpers/AuthHelpers");
const visitorCtrl = require("../controllers/visitor");

router.post("/saveVisitor", visitorCtrl.saveVisitor);

// for web api
router.post("/saveVisitorWeb", visitorCtrl.saveVisitorWeb);

router.get("/searchVisitor", visitorCtrl.searchVisitorNumber);

router.get("/resendOtp", visitorCtrl.resendOtp);

router.get("/getVisitors", AuthHelper.VerifyToken, visitorCtrl.getAllVisitors);

router.get(
  "/getEmployees",
  AuthHelper.VerifyVisitorToken,
  visitorCtrl.getEmployees
);

router.get(
  "/getVisitorDetails",
  AuthHelper.VerifyToken,
  visitorCtrl.getVisitorDetails
);

module.exports = router;
