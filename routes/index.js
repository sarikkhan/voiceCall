const express = require("express");
const { isArgumentsObject } = require("util/types");
const authentication = require("../controllers/authentication");
const callLogs = require("../controllers/callLogs");
const router = express.Router();
const { v4: uuidV4 } = require("uuid");

router.get("/profile", authentication.profile);

router.get("/sign-up", authentication.signUp);

router.post("/create", authentication.create);
router.post("/create-session", authentication.createSession);
router.get("/sign-out", authentication.signOut);
router.get("/call-history", callLogs.callHistory);
router.get("/frequently", callLogs.frequentlyCalled);
router.get("/contacts", callLogs.contactList);
router.get("/", authentication.home);
router.get("/new-call", function (req, res, next) {
  res.setHeader("Content-Type", "*/*");
  return res.redirect(`/new-call/${uuidV4()}`);
});
router.get("/new-call/:room", callLogs.newCall);
module.exports = router;
