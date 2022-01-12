let currentMeetings = [];
let upComingMeetings = [];
let completedMeetings = [];

let acceptedMeetings = [];
let rejectedMeetings = [];
let rescheduledMeetings = [];

const url = window.location.href;
let s = 0;
let si = 10;

let meetings = [];
let filteredMeetings = [];
let presentTab = "";

let timer;

async function searchFilter(e) {
  let filteredData;

  let searchText = e.target.value.toLowerCase().trim();

  if (searchText.length === 0) {
    meetings = filteredMeetings;
    buildclientTable();
    return;
  }

  clearTimeout(timer);
  timer = setTimeout(async () => {
    filteredData = await meetings.filter((meeting) => {
      let e = returnVariables(meeting);
      return (
        e.accepted.toString().includes(searchText) ||
        e.employee.name.toLowerCase().includes(searchText) ||
        e.meetingRaisedTime.toLowerCase().includes(searchText) ||
        e.meetingAcceptedTime.toLowerCase().includes(searchText) ||
        e.meetingRequestTime.toLowerCase().includes(searchText) ||
        e.meetingRejectedTime.toLowerCase().includes(searchText) ||
        e.meetingRescheduledOn.toLowerCase().includes(searchText) ||
        e.visitor.name.toLowerCase().includes(searchText) ||
        e.purpose.toLowerCase().includes(searchText) ||
        e.vehicleNumber.toLowerCase().includes(searchText)
      );
    });
    meetings = filteredData;
    buildclientTable();
  }, 500);
}

async function fetchCurrentMeetingsData() {
  //   showLoader();

  const api_url = URL + "/meeting/getAllMeetingByStatus?status=accepted";

  var result = await sendRequest("GET", api_url);
  if (result) {
    currentMeetings = result.meetings;
    // hideLoader();
  }
}

async function fetchUpcomingMeetingsData() {
  //   showLoader();

  const api_url = URL + "/meeting/getAllMeetingByStatus?status=upcoming";

  var result = await sendRequest("GET", api_url);
  if (result) {
    upComingMeetings = result.meetings;
    // hideLoader();
  }
}

async function fetchCompletedMeetingsData() {
  //   showLoader();

  const api_url = URL + "/meeting/getAllMeetingByStatus?status=completed";

  var result = await sendRequest("GET", api_url);
  if (result) {
    completedMeetings = result.meetings;
  }
}

async function fetchRejectedMeetingsData() {
  //   showLoader();

  const api_url = URL + "/meeting/getAllMeetingByStatus?status=rejected";
  var result = await sendRequest("GET", api_url);
  if (result) {
    rejectedMeetings = result.meetings;
  }
}

async function fetchRescheduledMeetingsData(i) {
  //   showLoader();

  const api_url = URL + "/meeting/getAllMeetingByStatus?status=reschedule";

  var result = await sendRequest("GET", api_url);

  if (result) {
    rescheduledMeetings = result.meetings;
  }
}

function returnVariables(m) {
  let data = {
    _id: m._id,
    status: m.status,
    visitor: m.visitor,
    employee: m.employee,
    purpose: m.purpose,
    vehicleNumber: m.vehicleNumber,
    meetingRaisedTime: m.meetingRaisedTime,
    meetingRequestTime: m.meetingRequestTime,
    meetingAcceptedTime: m.meetingAcceptedTime,
    meetingRejectedTime: m.meetingRejectedTime,
    meetingEndTime: m.meetingEndTime,
    meetingRescheduledOn: m.meetingRescheduledOn,
    accepted: m.accepted,
    rescheduled: m.rescheduled,
    additionalMembers: m.additionalMembers,
    otherBelongings: m.otherBelongings,
    isInProgress: m.isInProgress,
    meetingMinutesNotes: m.meetingMinutesNotes
      ? m.meetingMinutesNotes
      : "No Notes",
  };

  data.meetingRaisedTime = convertDate(
    data.meetingRaisedTime,
    "MMM DD , YYYY - hh:mm a "
  );
  data.meetingRequestTime = convertDate(
    data.meetingRequestTime,
    "MMM DD , YYYY - hh:mm a "
  );
  data.meetingAcceptedTime = convertDate(
    data.meetingAcceptedTime,
    "MMM DD , YYYY - hh:mm a "
  );

  data.meetingRejectedTime = convertDate(
    data.meetingRejectedTime,
    "MMM DD , YYYY - hh:mm a "
  );

  data.meetingEndTime = convertDate(
    data.meetingEndTime,
    "MMM DD , YYYY - hh:mm a "
  );
  data.meetingRescheduledOn = convertDate(
    data.meetingRescheduledOn,
    "MMM DD , YYYY - hh:mm a "
  );

  return data;
}

function buildclientTable() {
  let tableBody = $(".meetings-list");
  tableBody.empty();
  if (meetings == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No Meetings Found</h2>'
    );
  } else {
    let currentMeetingsCount = 0;
    const filMeetings = meetings.slice(s, si);
    filMeetings.forEach(async (meeting) => {
      currentMeetingsCount += 1;
      const m = returnVariables(meeting);
      let tablerow = `
          <tr onclick="openMeetingDetailsModal('${presentTab}' ,'${m._id}')">
          <th>
          <a  style="cursor:pointer; color:#0341fc;" href="#">${currentMeetingsCount}</a>
          </th>
          <th>
          <a  style="cursor:pointer; color:#0341fc;" href="visitor_profile.html?visitorId=${m.visitor._id}">${m.visitor.name}</a>
          </th>
          <th>
          <a  style="cursor:pointer; color:#0341fc;" href="employee_profile.html?employeeId=${m.employee._id}">${m.employee.name}</a>
          </th>
          <td>${m.purpose}</td>
          <td>${m.vehicleNumber}</td>
          <td>${m.meetingRaisedTime}</td>
          <td>${m.meetingAcceptedTime}</td>
          <td>${m.meetingRejectedTime}</td>
          <td>${m.meetingRescheduledOn}</td>
          <td>${m.meetingEndTime}</td>
         </tr>
          `;
      tableBody.append(tablerow);
    });
  }
}

function changeData(id) {
  presentTab = id;
  if (id === "current-meetings") {
    meetings = currentMeetings;
    filteredMeetings = currentMeetings;
    buildclientTable();
  } else if (id === "upcoming-meetings") {
    meetings = upComingMeetings;
    filteredMeetings = upComingMeetings;
    buildclientTable();
  } else if (id === "completed-meetings") {
    meetings = completedMeetings;
    filteredMeetings = completedMeetings;
    buildclientTable();
  } else if (id === "rejected-meetings") {
    meetings = rejectedMeetings;
    filteredMeetings = rejectedMeetings;
    buildclientTable();
  } else if (id === "rescheduled-meetings") {
    meetings = rescheduledMeetings;
    filteredMeetings = rejectedMeetings;
    buildclientTable();
  }
  const addClasses = {
    "current-meetings": "cm",
    "upcoming-meetings": "um",
    "completed-meetings": "com",
    "rejected-meetings": "rm",
    "rescheduled-meetings": "resm",
  };
  $(".meetings-navs .nav-link").removeClass("active");
  let className = ".meetings-navs ." + addClasses[id] + " .nav-link";
  $(className).addClass("active");
}

function openMeetingDetailsModal(type, mid) {
  console.log(type, mid);
  let m;
  let arrayType;
  let id = $(".mid");
  let vname = $(".vname");
  let ename = $(".ename");
  let mrt = $(".mrt");
  let mreqt = $(".mreqt");
  let mat = $(".mat");
  let mrejt = $(".mrejt");
  let mrest = $(".mrest");
  let met = $(".met");
  let acc = $(".acc");
  let res = $(".res");
  let bel = $(".bel");
  let mnotes = $(".mnotes");
  let status = $(".mstatus");

  if (type === "current-meetings") {
    arrayType = currentMeetings;
  } else if (type === "upcoming-meetings") {
    arrayType = upComingMeetings;
  } else if (type === "completed-meetings") {
    arrayType = completedMeetings;
  } else if (type === "rejected-meetings") {
    arrayType = rejectedMeetings;
  } else if (type === "rescheduled-meetings") {
    arrayType = rescheduledMeetings;
  }

  const data = arrayType.filter((e) => e._id === mid)[0];
  m = returnVariables(data);

  id.text(m._id);
  vname.html(
    `<a href='visitor_profile.html?visitorId=${m.visitor._id}'>${m.visitor.name}</a>`
  );
  ename.html(
    `<a href='employee_profile.html?employeeId=${m.employee._id}'>${m.employee.name}</a>`
  );

  mrt.text(m.meetingRaisedTime);
  mreqt.text(m.meetingRequestTime);
  mat.text(m.meetingAcceptedTime);
  mrejt.text(m.meetingRejectedTime);
  mrest.text(m.meetingRescheduledOn);
  met.text(m.meetingEndTime);
  acc.text(m.accepted);
  res.text(m.rescheduled);
  if (m.otherBelongings.length !== 0) {
    bel.text(m.otherBelongings.join(","));
  } else {
    bel.text("No Belongings ");
  }
  status.text(m.status);
  mnotes.text(m.meetingMinutesNotes);

  if (m.additionalMembers.length !== 0) {
    $(".additional-members ul").empty();
    m.additionalMembers.forEach((e) => {
      let body = `   <li>
          <p>Name : <span>${e.name}</span></p>
          <p>Phone : <span>${e.phone}</span></p>
      </li>`;

      $(".additional-members ul").append(body);
    });
  } else {
    $(".additional-members ul").empty();
    $(".additional-members ul").html("<h3>No additional members</h3>");
  }

  $("#meetingDetailsModal").modal("show");
}

const showData = async () => {
  await fetchCurrentMeetingsData();
  await fetchCompletedMeetingsData();
  await fetchUpcomingMeetingsData();
  await fetchRejectedMeetingsData();
  await fetchRescheduledMeetingsData();
};

showData().then(() => {
  hideLoader();
  createChart();
  meetings = currentMeetings;
  filteredMeetings = currentMeetings;
  presentTab = "current-meetings";
  buildclientTable();
});

function createChart() {
  const ctx = document.getElementById("meetingsChart").getContext("2d");
  const myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Rescheduled", "Upcoming", "Current", "Rejected", "Completed"],

      datasets: [
        {
          label: "No of meetings",
          data: [
            rescheduledMeetings.length,
            upComingMeetings.length,
            currentMeetings.length,
            rejectedMeetings.length,
            completedMeetings.length,
          ],
          backgroundColor: [
            "rgba(255,165,0 , 0.2)", //rescheduled
            "rgba(54, 162, 235, 0.2)", //upcoming
            "rgba(75, 192, 192, 0.1)", //currnet
            "rgba(243, 32, 19 , 0.3)", //rejected
            "rgba(75, 181, 67, 0.3)", //completed
          ],
          borderColor: [
            "rgba(255,165,0 , 0.2)", //rescheduled
            "rgba(54, 162, 235, 0.2)", //upcoming
            "rgba(75, 192, 192, 0.1)", //currnet
            "rgba(243, 32, 19 , 0.3)", //rejected
            "rgba(75, 181, 67, 0.3)", //completed
          ],
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      responsive: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function next() {
  if (s >= 0 && s < meetings.length - 10) {
    s += 10;
    si += 10;
    buildclientTable();
  }
}

function prev() {
  if (s > 0) {
    s -= 10;
    si -= 10;
    buildclientTable();
  }
}

function first() {
  if (s >= 0) {
    s = 0;
    si = 10;
    buildclientTable();
  }
}
