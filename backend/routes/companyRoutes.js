const express = require("express");
const router = express.Router();

const companyCtrl = require("../controllers/company");
const AuthHelper = require("../helpers/AuthHelpers");

router.post(
  "/create-company",
  AuthHelper.VerifyToken,
  companyCtrl.createCompany
);

router.post("/create-user", AuthHelper.VerifyToken, companyCtrl.createUser);

router.put(
  "/update-company",
  AuthHelper.VerifyToken,
  companyCtrl.updateCompany
);

router.put("/update-user", AuthHelper.VerifyToken, companyCtrl.updateUser);

router.delete(
  "/delete-company",
  AuthHelper.VerifyToken,
  companyCtrl.deleteCompany
);

router.delete("/delete-user", AuthHelper.VerifyToken, companyCtrl.deleteUser);

router.get("/get-companies", AuthHelper.VerifyToken, companyCtrl.getCompanies);

router.get("/get-users", AuthHelper.VerifyToken, companyCtrl.getUsers);

router.get("/get-company", AuthHelper.VerifyToken, companyCtrl.getCompany);

module.exports = router;
