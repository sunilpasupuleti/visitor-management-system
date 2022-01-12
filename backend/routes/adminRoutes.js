const express = require("express");
const router = express.Router();
const configModel = require("../models/configModels");

const adminCtrl = require("../controllers/admin");
const AuthHelper = require("../helpers/AuthHelpers");

router.post(
  "/setDepartments",
  AuthHelper.VerifyToken,
  adminCtrl.setDepartments
);

router.get("/getDepartments", AuthHelper.VerifyToken, adminCtrl.getDepartments);

router.get("/dashboard", AuthHelper.VerifyToken, adminCtrl.dashboard);

// create default
// configModel.create({});

module.exports = router;
