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

var firebaseadmin = require("firebase-admin");

var serviceAccount = require("./vistor-management-app-firebase.json");
const adminModels = require("./models/adminModels");

dotenv.config();
firebaseadmin.initializeApp({
  credential: firebaseadmin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

process.on("uncaughtException", (error, origin) => {
  console.log("----- Uncaught exception -----");
  console.log(error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("----- Reason -----");
  console.log(reason);
});

mongoose.Promise = global.Promise;

const connect = async () => {
  await mongoose.connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

connect().then(() => {});

let userBody = {
  email: "admin@gmail.com",
  emailVerified: true,
  password: "123456",
  displayName: "Super Admin",
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

const app = express();

app.use("", express.static(path.join(__dirname, "ui")));

app.use(
  cors({
    credentials: true,
    origin: "*",
    // allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/auth", auth);
app.use("/visitor", visitor);
app.use("/admin", admin);
app.use("/employee", employee);
app.use("/meeting", meeting);
app.use("/company", company);

const http = require("http").Server(app);

http.listen(process.env.PORT || 8080, () => {
  console.log(`server started on port number ${process.env.PORT}`);
});
