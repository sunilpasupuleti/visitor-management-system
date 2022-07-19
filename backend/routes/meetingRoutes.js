const express = require("express");
const router = express.Router();

const meetingCtrl = require("../controllers/meeting");
const AuthHelper = require("../helpers/AuthHelpers");

router.post(
  "/requestForMeeting",
  AuthHelper.VerifyVisitorToken,
  meetingCtrl.requestForMeeting
);

router.post(
  "/requestForMeetingWeb",
  AuthHelper.VerifyVisitorToken,
  meetingCtrl.requestForMeetingWeb
);

router.post(
  "/updateMeetingStatus",
  AuthHelper.VerifyToken,
  meetingCtrl.updateMeetingStatus
);

// update status meeting for qr flow app
router.post(
  "/updateMeetingStatusQrFlow",
  AuthHelper.VerifyToken,
  meetingCtrl.updateMeetingStatusQrFlow
);

// get all meetings by company
router.get(
  "/getAllMeetings",
  AuthHelper.VerifyToken,
  meetingCtrl.getAllMeetings
);

router.get("/searchMeeting", AuthHelper.VerifyToken, meetingCtrl.searchMeeting);

router.get("/getMeetingDetails", meetingCtrl.getMeetingDetails);

router.get(
  "/getAllMeetingByStatus",
  AuthHelper.VerifyToken,
  meetingCtrl.getAllMeetingByStatus
);

router.get("/getVisitorMeetings", meetingCtrl.getVisitorMeetings);

module.exports = router;
