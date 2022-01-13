const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const auth = require("./routes/authRoutes");
const visitor = require("./routes/visitorRoutes");
const employee = require("./routes/employeeRoutes");
const company = require("./routes/companyRoutes");
const admin = require("./routes/adminRoutes");
const meeting = require("./routes/meetingRoutes");
const employeeModel = require("./models/employeeModels");

var firebaseadmin = require("firebase-admin");

var serviceAccount = require("./vistor-management-app-firebase.json");
const adminModels = require("./models/adminModels");

firebaseadmin.initializeApp({
  credential: firebaseadmin.credential.cert(serviceAccount),
  databaseURL: "https://v-m-s-928ee-default-rtdb.firebaseio.com",
  storageBucket: "v-m-s-928ee.appspot.com",
});

process.on("uncaughtException", (error, origin) => {
  console.log("----- Uncaught exception -----");
  console.log(error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("----- Reason -----");
  console.log(reason);
});

let userBody = {
  email: "sunil.pandvd22@gmail.com",
  emailVerified: true,
  password: "123456",
  displayName: "Sunil Kumar",
  disabled: false,
};
firebaseadmin
  .auth()
  .createUser(userBody)
  .then(async function (userRecord) {
    delete userBody.disabled;
    delete userBody.emailVerified;
    await adminModels.create({
      ...userBody,
      uid: userRecord.uid,
      role: "Super Admin",
      name: userBody.displayName,
    });
    // See the UserRecord reference doc for the contents of userRecord.
    console.log("Successfully created Super Admin:", userRecord.uid);
  })
  .catch((err) => {});

dotenv.config();

const app = express();

app.use("", express.static(path.join(__dirname, "ui")));

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/auth", auth);
app.use("/visitor", visitor);
app.use("/admin", admin);
app.use("/employee", employee);
app.use("/meeting", meeting);
app.use("/company", company);

const http = require("http").Server(app);

mongoose.Promise = global.Promise;

mongoose.connect(process.env.URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

http.listen(process.env.PORT || 8080, () => {
  console.log(`server started on port number ${process.env.PORT}`);
});
