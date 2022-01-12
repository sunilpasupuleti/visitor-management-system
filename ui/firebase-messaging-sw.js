importScripts('https://www.gstatic.com/firebasejs/8.3.0/firebase-app.js');





self.addEventListener("notificationclick", function (e) {
  try {
    const notifObj = {};
    let myHost = "http://n-admin.herokuapp.com";
    try {
      notifObj.title = e.notification.title;
      notifObj.body = e.notification.body;
      notifObj.data = e.notification.data; // for custom push handler
      notifObj.orderId = notifObj.data.FCM_MSG.data.orderId;
      myHost = e.target.location.origin; // without trailing slash
    } catch (error) {
      console.error(error);
    }
    console.log(JSON.stringify(notifObj));
    let url_path = `/admin/order_details.html?orderId=${notifObj.orderId}`;
    // let redirect_path = myHost+`/order_details.html?orderId=${notifObj.orderId}`;
    // This looks to see if the current is already open and
    // focuses if it is
    e.waitUntil(clients.matchAll({
      type: "window"
    }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url == url_path && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow)
        return clients.openWindow(url_path);
    }).catch(console.error));
    
  } catch (erout) {
    console.error(erout);
  }
});




importScripts('https://www.gstatic.com/firebasejs/8.3.0/firebase-messaging.js');

var firebaseConfig = {
  apiKey: "AIzaSyBjbCp7iVSfcwqGGXWLbK3RKLa1wkRcP5Y",
  authDomain: "notarizetech.firebaseapp.com",
  projectId: "notarizetech",
  storageBucket: "notarizetech.appspot.com",
  messagingSenderId: "930265591725",
  appId: "1:930265591725:web:59860c5182a41c0cb6fb24",
  measurementId: "G-MJPY1SGKT7"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
