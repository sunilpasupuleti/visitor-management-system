const express = require("express");
const router = express.Router();

const AuthHelper = require("../helpers/AuthHelpers");
const employeeCtrl = require("../controllers/employee");

router.post("/addEmployee", AuthHelper.VerifyToken, employeeCtrl.addEmployee);

router.get("/getEmployees", AuthHelper.VerifyToken, employeeCtrl.getEmployees);

router.get("/getVisitors", AuthHelper.VerifyToken, employeeCtrl.getVisitors);

router.get("/getDashboard", AuthHelper.VerifyToken, employeeCtrl.getDashboard);

router.put("/editEmployee", AuthHelper.VerifyToken, employeeCtrl.editEmployee);

router.put(
  "/vacation-mode",
  AuthHelper.VerifyToken,
  employeeCtrl.updateVacationMode
);

router.delete(
  "/deleteEmployee",
  AuthHelper.VerifyToken,
  employeeCtrl.deleteEmployee
);

router.get(
  "/getEmployeeDetails",
  AuthHelper.VerifyToken,
  employeeCtrl.getEmployeeDetails
);

module.exports = router;
