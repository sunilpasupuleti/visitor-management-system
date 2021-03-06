const express = require("express");
const router = express.Router();

const AuthHelper = require("../helpers/AuthHelpers");
const authCtrl = require("../controllers/auth");

router.post("/adminLogin", authCtrl.adminLogin);

module.exports = router;
