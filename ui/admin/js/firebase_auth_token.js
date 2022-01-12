// var firebaseConfig = {
//   apiKey: "AIzaSyBjbCp7iVSfcwqGGXWLbK3RKLa1wkRcP5Y",
//   authDomain: "notarizetech.firebaseapp.com",
//   projectId: "notarizetech",
//   storageBucket: "notarizetech.appspot.com",
//   messagingSenderId: "930265591725",
//   appId: "1:930265591725:web:59860c5182a41c0cb6fb24",
//   measurementId: "G-MJPY1SGKT7"
// };

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLXEho5i2s1nDhnGdOTmyGSi0TfIRMMD8",
  authDomain: "zenwin-app.firebaseapp.com",
  databaseURL: "https://zenwin-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zenwin-app",
  storageBucket: "zenwin-app.appspot.com",
  messagingSenderId: "591444715828",
  appId: "1:591444715828:web:d8865a2cae722a68b69d61",
  measurementId: "G-JS7P1KYR6S"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.auth().onIdTokenChanged(function (user) {
  if (user) {
    // User is signed in or token was refreshed.
    user
      .getIdToken()
      .then((tok) => {
        localStorage.setItem("token", tok);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
