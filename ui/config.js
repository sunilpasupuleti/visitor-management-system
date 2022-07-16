var URL = "http://localhost:3000";
var URL1 = "https://api-vms.herokuapp.com";
var URL2 = "https://backend-vms.webwizard.in";

// const firebaseConfig = {
//   apiKey: "AIzaSyDGOiun7dENeOS5XvkJNWXORVf7XvDd6gc",
//   authDomain: "vistor-management-app.firebaseapp.com",
//   databaseURL:
//     "https://vistor-management-app-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "vistor-management-app",
//   storageBucket: "vistor-management-app.appspot.com",
//   messagingSenderId: "165722032972",
//   appId: "1:165722032972:web:298b39b875ea9ac1ff9de9",
//   measurementId: "G-3YTJKSQ8JM",
// };

const firebaseConfig = {
  apiKey: "AIzaSyAKmBtKIgBC5vE-wk0JIU2m6TeVW_rSD0s",
  authDomain: "v-m-s-928ee.firebaseapp.com",
  projectId: "v-m-s-928ee",
  storageBucket: "v-m-s-928ee.appspot.com",
  messagingSenderId: "270254228848",
  appId: "1:270254228848:web:9f9ee8a0708f889e2ebbb5",
  measurementId: "G-88KJN5MQHW",
};

// Print Screen Function
function printDiv(divName) {
  var printContents = document.getElementById(divName).innerHTML;
  var originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;

  window.print();

  document.body.innerHTML = originalContents;
}

firebase.initializeApp(firebaseConfig);

firebase.analytics();
const messaging = firebase.messaging();

// var storage = firebase.storage();

async function onLogout() {
  await firebase.auth().signOut();
  localStorage.clear();
  window.location.href = "/index.html";
}

function getToken() {
  return localStorage.getItem("data-token");
}

function getPayload() {
  const data = getToken();
  if (data) {
    let payload = data.split(".")[1];
    payload = JSON.parse(window.atob(payload));
    return payload.data;
  } else {
    return null;
  }
}

async function sendRequest(
  type,
  url,
  data,
  headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("token"),
  }
) {
  let res = null;
  await $.ajax({
    type: type,
    url: url,
    data: data ? JSON.stringify(data) : null,
    headers: headers,
    success: function (response) {
      res = response;
    },
    error: function (error) {
      let title;
      let callback;
      if (error.responseJSON) {
        console.log(error);
        title = error.responseJSON.message;
        if (error.responseJSON.token && error.responseJSON.token === "false") {
          callback = () => {
            onLogout();
          };
        } else {
          callback = () => {
            hideLoader();
          };
        }
      } else {
        title = error.statusText;
        callback = () => {
          hideLoader();
        };
      }
      swal({
        title: title,
        type: "error",
        icon: "error",
      }).then(callback);
    },
  });
  return res;
}

function convertDate(date, format) {
  if (!date) {
    return "No date";
  }
  var dt = moment(date);
  var dateTime = dt.format(format);
  return dateTime;
}

function addNav(activeId) {
  var navHtml = `
  <nav class="sidenav navbar navbar-vertical  fixed-left  navbar-expand-xs navbar-light bg-white" id="sidenav-main">
  <div class="scrollbar-inner">
      <!-- Brand -->
      <div class="sidenav-header  align-items-center">
          <a class="navbar-brand" href="index.html">
              <img src="logo_border.png" class="navbar-brand-img" alt="..." />
          </a>
      </div>
      <div class="navbar-inner">
          <!-- Collapse -->
          <div class="collapse navbar-collapse" id="sidenav-collapse-main">
              <!-- Nav items -->

              <ul class="navbar-nav">
                  <li class="nav-item ">
                      <a id='dashboard' class="nav-link " href="index.html">
                          <i class="ni ni-tv-2 text-primary"></i>
                          <span class="nav-link-text ">Dashboard</span>
                      </a>
                  </li>

                  <li class="nav-item ismaster-link">
                      <a id='company'  class="nav-link " href="companies.html">
                          <i class="far fa-building text-primary"></i>
                          <span class="nav-link-text ">Companies</span>
                      </a>
                  </li>

                  <li class="nav-item ismaster-link">
                      <a id='user' class="nav-link " href="users.html">
                          <i class="fas fa-user-friends text-primary"></i>
                          <span class="nav-link-text ">Add Users</span>
                      </a>
                  </li>

                  <li class="nav-item isadmin-link">
                      <a id='visitor' class="nav-link " href="visitors.html">
                          <i class="fas fa-male text-primary"></i>
                          <span class="nav-link-text ">Visitors</span>
                      </a>
                  </li>
                  <li class="nav-item isadmin-link">
                      <a  id='employee' class="nav-link" href="employees.html">
                          <i class="fas fa-user text-primary"></i>
                          <span class="nav-link-text">Employees</span>
                      </a>
                  </li>
                

                  <li class="nav-item isadmin-link">
                      <a id='meeting' class="nav-link  " href="meetings.html">
                          <i class="fas fa-handshake text-primary"></i>
                          <span class="nav-link-text ">Meetings</span>
                      </a>
                  </li>
          
                  <li id='logout' class="nav-item" onclick="onLogout()">
                      <a class="nav-link" style="cursor: pointer;">
                          <i class="ni ni-button-power text-dark"></i>
                          <span class="nav-link-text">Logout</span>
                      </a>
                  </li>
              </ul>
          </div>
      </div>
  </div>
</nav>

  `;

  var mobileNavHtml = `
  <div class="navbar navbar-expand-xl bg-white navbar-light">
  <!-- Brand -->
  <div
    class="navbar-brand"
    onclick="(function(){location.href='/admin/index.html'})();"
  >
    VMS
  </div>

  <!-- Toggler/collapsibe Button -->
  <button
    class="navbar-toggler"
    type="button"
    data-toggle="collapse"
    data-target="#collapsibleNavbar"
  >
    <span class="navbar-toggler-icon"></span>
  </button>

  <!-- Navbar links -->
  <div class="collapse navbar-collapse" id="collapsibleNavbar">
    <ul class="navbar-nav mt-3">
      <li class="nav-item">
        <a id="dashboard" class="nav-link" href="index.html">
          <span>Dashboard</span>
          <i class="fas fa-tv"></i>
        </a>
      </li>

      <li class="nav-item ismaster-link">
        <a id="company" class="nav-link" href="companies.html">
          <span>Companies</span>
          <i class="far fa-building"></i>
        </a>
      </li>

      <li class="nav-item ismaster-link">
        <a id="user" class="nav-link" href="users.html">
          <span>Add Users</span>
          <i class="fas fa-user-friends"></i>
        </a>
      </li>

      <li class="nav-item isadmin-link">
        <a id="visitor" class="nav-link" href="visitors.html">
          <span>Visitors</span>
          <i class="fas fa-male"></i>
        </a>
      </li>
      <li class="nav-item isadmin-link">
        <a id="employee" class="nav-link" href="employees.html">
          <span>Employees</span>
          <i class="fas fa-user"></i>
        </a>
      </li>

      <li class="nav-item isadmin-link">
        <a id="meeting" class="nav-link" href="meetings.html">
          <span>Meetings</span>
          <i class="fas fa-handshake"></i>
        </a>
      </li>

      <li id="logout" class="nav-item" onclick="onLogout()">
        <a class="nav-link" style="cursor: pointer">
          <span>Logout</span>
          <i class="fas fa-sign-out-alt text-dark"></i>
        </a>
      </li>
    </ul>
  </div>
</div>
  `;
  var headerHtml = `
<!-- Topnav -->
<nav class="navbar navbar-top navbar-expand border-bottom">
  <div class="container-fluid">
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <!-- Search form -->

      <!-- Navbar links -->
      <ul class="navbar-nav align-items-center ml-md-auto">
        <li class="nav-item d-xl-none">
          <!-- Sidenav toggler -->
          <div
            class="pr-3 sidenav-toggler sidenav-toggler-dark"
            data-action="sidenav-pin"
            data-target="#sidenav-main"
          >
            <div class="sidenav-toggler-inner">
              <i class="sidenav-toggler-line"></i>
              <i class="sidenav-toggler-line"></i>
              <i class="sidenav-toggler-line"></i>
            </div>
          </div>
        </li>
        <i class="fas fa-print download" onclick="printDiv('panel')"></i>

        <li
          class="nav-link isadmin-link"
          onclick="set_departments()"
          data-toggle="modal"
          data-target="#configModal"
        >
          <a>
            <i class="fas fa-cog"></i>
          </a>
        </li>

        <li class="nav-item dropdown">
          <div
            class="dropdown-menu dropdown-menu-xl dropdown-menu-right py-0 overflow-hidden"
          >
            <div class="px-3 py-3">
              <h6 class="text-sm text-muted m-0">
                You have
                <strong
                  class="text-primary num-of-notifications"
                ></strong>
                notifications.
              </h6>
              <p
                class="mini-loader mx-auto"
                style="border-top: 2px solid #5e72e4"
              ></p>
            </div>
            <!-- List group -->
            <div
              class="list-group notification-list-group list-group-flush"
            ></div>
            <!-- View all -->
            <div
              class="pagination justify-content-center my-3 notification-page-buttons"
            ></div>
          </div>
        </li>
      </ul>
      <ul class="navbar-nav align-items-center ml-auto ml-md-0">
        <li class="nav-item dropdown">
          <a
            class="nav-link pr-0"
            href="#"
            role="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <div class="media align-items-center">
              <span class="avatar avatar-sm rounded-circle">
                <div class="text-center profile-picture"></div>
              </span>
              <div class="media-body ml-2 d-none d-lg-block">
                <span
                  class="mb-0 text-sm font-weight-bold profile-username"
                ></span>
              </div>
            </div>
          </a>
        </li>
      </ul>
    </div>
  </div>
</nav>
`;

  var configModel = `
  <div class="modal fade isadmin-link" id="configModal" >
  <div class="modal-dialog">
    <div class="modal-content">
      <!-- Modal Header -->
      <div class="modal-header">
        <h4 class="modal-title">Config</h4>
      </div>

      <!-- Modal body -->
      <div class="modal-body">
        <div class="row">
          <div class="col-lg-12">
            <div class="row form-group d-flex">
              <div class="col-xl-12">
                <label
                  class="form-control-label mr-3"
                  for="departments"
                  >Departments (press enter after keyword)
                </label>
              </div>
              <div
                class="col-xl-12 departments-input custom-control custom-control-alternative"
              >
                <input
                  class="form-control"
                  id="departments"
                  name="departments"
                  type="text"
                  value=""
                  placeholder="Add / Edit departments"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal footer -->
      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          data-dismiss="modal"
        >
          Close
        </button>
        <button
          type="button"
          class="btn btn-primary"
          onclick="updateDepartments()"
        >
          Update
        </button>
      </div>
    </div>
  </div>
</div>
  `;

  var scripts = `
  <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
  `;

  var cloneMainContent = $(".main-content").clone();
  $(".main").remove();

  $("body").append(navHtml);
  $("body").append(cloneMainContent);
  $(".header").append(headerHtml);
  $("body").append(configModel);
  $("body").append(scripts);

  let payload = getPayload();
  $(".profile-username").html(`${payload.name}`);
  $(".profile-picture").html(payload.name.charAt(0));

  let width = window.innerWidth;
  if (width < 1200) {
    console.log("yes add mobile nav");
    $(".mobile-nav").append(mobileNavHtml);
  }

  $("#" + activeId).addClass("active");
  $("#" + activeId + " span").addClass("text-primary");

  let data = getPayload();
  let role = data.role;
  var isMasteradmin = role === "Super Admin";
  var isAdmin = role === "Admin";
  if (!isMasteradmin) {
    $(".ismaster-link").remove();
  }

  if (!isAdmin) {
    $(".isadmin-link").remove();
  }
}

function preventRoute(role) {
  let data = getPayload();
  if (data.role != role) {
    location.href = "/admin/index.html";
  }
}
