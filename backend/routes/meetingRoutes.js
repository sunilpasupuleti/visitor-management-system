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
  "/updateMeetingStatus",
  AuthHelper.VerifyToken,
  meetingCtrl.updateMeetingStatus
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
