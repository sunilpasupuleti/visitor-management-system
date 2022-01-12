let msgerInput = document.querySelector(".msger-input");
let msgerChat = document.querySelector(".msger-chat");
const msgerForm = document.querySelector(".msger-inputarea");

function showSendLoader() {
  $(".send-button-loader").show();
}
function hideSendLoader() {
  $(".send-button-loader").hide();
}

msgerForm.addEventListener("submit", (event) => {
  showSendLoader();
  event.preventDefault();
  const msgText = msgerInput.value;
  if (!msgText) return;
  sendMessages(msgText);
});
const PERSON_IMG = localStorage.getItem("userImageURL");
const PERSON_NAME = localStorage.getItem("firstName");

let chatroomId;
var firebaseConfig = {
  apiKey: "AIzaSyBjbCp7iVSfcwqGGXWLbK3RKLa1wkRcP5Y",
  authDomain: "notarizetech.firebaseapp.com",
  projectId: "notarizetech",
  storageBucket: "notarizetech.appspot.com",
  messagingSenderId: "930265591725",
  appId: "1:930265591725:web:59860c5182a41c0cb6fb24",
  measurementId: "G-MJPY1SGKT7"
};

firebase.initializeApp(firebaseConfig);
// firebase.analytics();

const messaging = firebase.messaging();
// let pageNumber = 0

// messaging.onMessage((payload) => {
//   console.log("Received a message === ",payload);
//   let mymsg = payload["data"];
//   let myuser = JSON.parse(mymsg["title"]);
//   let mydata = {
//       message:mymsg["body"],
//       username:myuser["name"]+"#"+myuser["sentBy"]+"#"+myuser["_id"],
//       userImageURL:myuser["userImageURL"]
//   };
//   appendMessage1(mydata.username,mydata.userImageURL,'',mydata.message);
//   appendMessage1(mymsg.sentBy.firstName, mymsg.sentBy.userImageURL, "right", mymsg.message,mymsg.sentAt);

// });

messaging.onMessage((payload) => {
  console.log("Received a message === ", payload);
  let mymsg = payload["data"];
  let myuser = JSON.parse(mymsg["sentBy"]);

  var adminId = localStorage.getItem("adminId");
  if (adminId == myuser["_id"]) {
    appendMessage1(
      myuser.firstName,
      myuser.userImageURL,
      "right",
      mymsg.message,
      mymsg.sentAt
    );
  } else {
    appendMessage1(
      myuser.firstName,
      myuser.userImageURL,
      "left",
      mymsg.message,
      mymsg.sentAt
    );
  }
});


function chat() {
  pageNumber = 0;
  $('#chat-div').css('display', 'block');
  $('#chatBtn').css('display', 'none');
  $('.chat-pop').css('display', 'none');

  listMessages(pageNumber, chatroomId);

  msgerChat = document.querySelector(".msger-chat");

  msgerChat.addEventListener("scroll", function () {
    if (msgerChat.scrollTop == 0) {
      pageNumber++;
      console.log(pageNumber);
      $("#loader1").show();
      listMessages(pageNumber, chatroomId);
    }
  });
}


function listMessages(n, cid) {
  chatroomId = cid;
  const token = localStorage.getItem("jwtToken");
  const bodyData = {
    chatroomId,
    adminId: localStorage.getItem("adminId"),
    pageNumber: n,
  };

  fetch("https://api.notarizetech.com/admin/order/listMessages", {
      method: "POST",
      body: JSON.stringify(bodyData),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      $("#chat-loader").hide();
      if (data.status) {
        if (data.chatMessages.length === 0) {
          swal({
            icon: "success",
            title: "You are all caught up!",
            showConfirmButton: false,
            timer: 1500,
          });
          pageNumber = data.pageCount;
        } else {
          listResponses(data.chatMessages);
          $(".msger-chat").scrollTop(500);
        }
      } else {
        $("#loader1").hide();
        console.log("Hi");
        swal({
          icon: "success",
          title: "No Chat Messages",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function appendMessage(name, img, side, text, time) {
  console.log("Append");

  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${
            time ? formatMB(time) : formatDate(new Date())
          }</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;
  // msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  $(".msger-chat").prepend(msgHTML);
}

function appendMessage1(name, img, side, text, time) {
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${
            time ? formatMB(time) : formatDate(new Date())
          }</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;
  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
  // $('.msger-chat').prepend(msgHTML);
}

function sendMessages(text) {
  console.log(chatroomId);

  const bodyData = {
    chatroomId,
    adminId: localStorage.getItem("adminId"),
    chatMessage: text,
  };

  fetch("https://api.notarizetech.com/admin/order/sendMessage", {
      method: "POST",
      body: JSON.stringify(bodyData),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      if (data.status) {
        appendMessage1(PERSON_NAME, PERSON_IMG, "right", text, null);
        msgerInput.value = "";
        hideSendLoader();
      }
    })
    .catch((err) => {
      console.error(err);
      hideSendLoader();
    });
}

function listResponses(messages) {
  console.log("Hello");
  const adminId = localStorage.getItem("adminId");

  messages.reverse();

  messages.forEach((msg) => {
    if (msg.sentBy._id == adminId) {
      appendMessage(
        msg.sentBy.firstName,
        msg.sentBy.userImageURL,
        "right",
        msg.message,
        msg.sentAt
      );
    } else {
      appendMessage(
        msg.sentBy.firstName,
        msg.sentBy.userImageURL,
        "left",
        msg.message,
        msg.sentAt
      );
    }
  });
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();

  return `${h.slice(-2)}:${m.slice(-2)}`;
}

function formatMB(x) {
  return new Date(x).toString().substring(16, 21);
}