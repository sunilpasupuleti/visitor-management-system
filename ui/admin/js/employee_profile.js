const urlParams = new URLSearchParams(window.location.search);
let employeeId = urlParams.get("employeeId");
preventRoute("Admin");

let employeeMeetings;

let AllemployeeMeetings;

let timer;

let firstLoading = true;

async function rangeData() {
  var from = document.getElementById("from_date").value;
  var to = document.getElementById("to_date").value;
  from = new Date(from).getTime();

  var custom = true;

  to = new Date(to).getTime();
  var url =
    URL +
    "/employee/getEmployeeDetails?employeeId=" +
    employeeId +
    "&custom=" +
    custom +
    "&startTime=" +
    from +
    "&endTime=" +
    to;

  if (!from || !to) {
    alert("Please selct from and to range");
  } else {
    showLoader();

    var result = await sendRequest("GET", url);

    if (result) {
      let data = result;
      employeeMeetings = data.meetings;
      AllemployeeMeetings = data.meetings;
      buildEmployeeFilter(data);
      destroyCharts();
      buildUserData(data);
      updateDetailsCard(data);
      buildMeetingsTable();
      createCompletedChart(data);
      createAnalysedChart(data);
      hideLoader();
      $("html, body").animate(
        {
          scrollTop: 2500,
        },
        500
      );
    }
  }
}

async function fetchUserData() {
  const api_url = URL + "/employee/getEmployeeDetails?employeeId=" + employeeId;
  var result = await sendRequest("GET", api_url);

  if (result) {
    let data = result;
    employeeMeetings = data.meetings;
    AllemployeeMeetings = data.meetings;
    buildEmployeeFilter(data);
    buildUserData(data);
    updateDetailsCard(data);
    buildMeetingsTable();
    createCompletedChart(data);
    createAnalysedChart(data);
    createStackedChart(data.meetingsByMonthAndYear);
    hideLoader();
  }
}

fetchUserData();

function buildEmployeeFilter(data) {
  let addEmpName = $("#visitor-name");
  data.visitors.forEach((element) => {
    let option = `<option value='${element.name}'>${element.name}</option>`;
    addEmpName.append(option);
  });
}

function sortByFilter() {
  let sortByVis = $("#visitor-name").val();
  let sortByStatus = $("#status").val();
  let filteredData;

  let isEmpVal = true;

  if (sortByVis === "" || sortByVis === "default") {
    isEmpVal = false;
  }

  filteredData = AllemployeeMeetings.filter((e) => {
    let sortStatus;
    if (sortByStatus === "completed") {
      let checkString = e.status === "completed" && !e.isInProgress;
      sortStatus = isEmpVal
        ? e.visitor.name === sortByVis && checkString
        : checkString;
    } else if (sortByStatus === "rejected") {
      let checkString = e.status === "rejected" && !e.accepted;
      sortStatus = isEmpVal
        ? e.visitor.name === sortByVis && checkString
        : checkString;
    } else if (sortByStatus === "upcoming") {
      let checkString = (sortStatus =
        e.status === "upcoming" && !e.isInProgress);
      sortStatus = isEmpVal
        ? e.visitor.name === sortByVis && checkString
        : checkString;
    } else if (sortByStatus === "rescheduled") {
      let checkString = e.status === "reschedule" && e.rescheduled;
      sortStatus = isEmpVal
        ? e.visitor.name === sortByVis && checkString
        : checkString;
    } else if (sortByStatus === "inprogress") {
      let checkString = e.status === "accepted" && e.isInProgress;
      sortStatus = isEmpVal
        ? e.visitor.name === sortByVis && checkString
        : checkString;
    } else if (sortByStatus === "nothing" || sortByStatus === "") {
      sortStatus = isEmpVal ? e.visitor.name === sortByVis : true;
    }

    return sortStatus;
  });

  employeeMeetings = filteredData;
  buildMeetingsTable();
}

async function buildUserData(data) {
  console.log(data);
  let employee = data.employee;
  const {
    _id,
    name,
    phone,
    email,
    uid,
    title,
    employeeAdeedOn,
    totalMeetingsDone,
    isOnVacationMode,
  } = employee;

  var date = convertDate(employeeAdeedOn, "MMM DD ,  YYYY");
  $("#name").val(name);
  $("#phone").val(phone);
  $("#email").val(email);
  $("#total-meetings-done").val(totalMeetingsDone);
  $("#addedon").val(date);
  $("#uid").val(uid);
  $("#title").val(title);
  $("#vacmode").val(isOnVacationMode);

  updateCompletedMeetings(data.totalMeetingsDone);
  /* Display buttons */
  //getPageButtons(pageCount);
}

function buildMeetingsTable() {
  let tableBody = $(".meetings-list");
  tableBody.empty();
  const meetings = employeeMeetings;
  if (meetings == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No Meetings Found</h2>'
    );
  } else {
    let completedMeetingCount = 0;
    meetings.forEach(async (meeting) => {
      completedMeetingCount += 1;

      const m = returnVariables(meeting);
      let tablerow = `
              <tr onclick="openMeetingDetailsModal('${m._id}')">
              <th>
              <a  style="cursor:pointer; color:#0341fc;" href="#">${completedMeetingCount}</a>
              </th>
              <th>
              <a  style="cursor:pointer; color:#0341fc;" href="visitor_profile.html?visitorId=${m.visitor._id}">${m.visitor.name}</a>
              </th>
              <th>
              <a  style="cursor:pointer; color:#0341fc;" href="employee_profile.html?employeeId=${m.employee._id}">${m.employee.name}</a>
              </th>
              <td> <b>${m.status}</b> </td>

              <td>${m.purpose}</td>
              <td>${m.vehicleNumber}</td>
              <td>${m.meetingRaisedTime}</td>
              <td>${m.meetingAcceptedTime}</td>
              <td>${m.meetingRejectedTime}</td>
              <td>${m.meetingRescheduledOn}</td>
              <td>${m.meetingEndTime}</td>
             
              `;
      tableBody.append(tablerow);
    });
  }
}

function updateDetailsCard(data) {
  $("#total-meetings-done-details-card").html(data.totalMeetingsDoneLength);

  $("#total-rejected-meetings").html(data.totalRejectedMeetingsDoneLength);

  $("#total-rescheduled-meetings").html(
    data.totalRescheduledMeetingsDoneLength
  );

  $("#current-meetings-on-site").html(data.currentMeetingsOnSite);

  $("#today-upcoming-meetings").html(data.upComingMeetings);
}

function updateCompletedMeetings(meetings) {
  const v = returnValues(meetings);
  $("#T-completed-meetings").html(v.day.count);

  $("#W-completed-meetings").html(v.week.count);

  $("#M-completed-meetings").html(v.month.count);

  $("#Y-completed-meetings").html(v.year.count);
}

function displayMeetings(meeting) {
  var tabName = meeting.name;
  let tabType = tabName.slice(2);
  $(`.${tabType}`).css("display", "none");
  $(`#${tabName}`).css("display", "block");
  $(`.${tabType}-tab`).removeClass("active");
  $(this).addClass("active");
}

function returnValues(meetings) {
  let day = {
    count: meetings.today ? meetings.today : 0,
  };

  let week = {
    count: meetings.thisWeek ? meetings.thisWeek : 0,
  };

  let month = {
    count: meetings.thisMonth ? meetings.thisMonth : 0,
  };

  let year = {
    count: meetings.thisYear ? meetings.thisYear : 0,
  };

  return { week, day, month, year };
}

function returnVariables(m) {
  let data = {
    _id: m._id,
    status: m.status,
    visitor: m.visitor,
    employee: m.employee,
    rejectedReasons: m.rejectedReasons,

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

function openMeetingDetailsModal(mid) {
  console.log(mid);
  let m;
  let id = $(".mid");
  let vname = $(".vname");
  let ename = $(".ename");
  let mrt = $(".mrt");
  let mreqt = $(".mreqt");
  let mat = $(".mat");
  let mrejt = $(".mrejt");
  let mrejr = $(".mrejreasons");

  let mrest = $(".mrest");
  let met = $(".met");
  let acc = $(".acc");
  let res = $(".res");
  let bel = $(".bel");
  let mnotes = $(".mnotes");
  let status = $(".mstatus");

  const data = employeeMeetings.filter((e) => e._id === mid)[0];
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
  mrejr.text(m.rejectedReasons);

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

async function searchFilter(e) {
  let filteredData;

  let searchText = e.target.value.toLowerCase().trim();

  if (searchText.length === 0) {
    employeeMeetings = AllemployeeMeetings;
    buildMeetingsTable();
    return;
  }

  clearTimeout(timer);

  timer = setTimeout(async () => {
    filteredData = await employeeMeetings.filter((meeting) => {
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
        e.vehicleNumber.toLowerCase().includes(searchText) ||
        e.status.toLowerCase().includes(searchText)
      );
    });
    employeeMeetings = filteredData;
    buildMeetingsTable();
  }, 500);
}

function destroyCharts() {
  completedmeetingschart.destroy();
  analysedchart.destroy();
}

let analysedchart, completedmeetingschart, stackedchart;

function createAnalysedChart(data) {
  const ctx = document.getElementById("analysedChart").getContext("2d");
  analysedchart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Rescheduled", "Upcoming", "Current", "Rejected", "Completed"],

      datasets: [
        {
          label: "No of meetings",
          data: [
            data.totalRescheduledMeetingsDoneLength,
            data.upComingMeetings,
            data.currentMeetingsOnSite,
            data.totalRejectedMeetingsDoneLength,
            data.totalMeetingsDoneLength,
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

function createCompletedChart(data) {
  const v = returnValues(data.totalMeetingsDone);
  const ctx = document
    .getElementById("dashboardCompletedChart")
    .getContext("2d");
  completedmeetingschart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Today", "This Week", "This Month", "This Year"],

      datasets: [
        {
          label: "No of Completed Meetings",
          data: [v.day.count, v.week.count, v.month.count, v.year.count],

          backgroundColor: [
            "rgba(75, 192, 192, 0.2)",
            "rgba(255, 159, 64, 0.2)",
            "rgba(255, 205, 86, 0.2)",
            "rgba(255, 99, 132, 0.2)",
          ],
          borderColor: [
            "rgb(75, 192, 192)",
            "rgb(255, 159, 64)",
            "rgb(255, 205, 86)",
            "rgb(255, 99, 132)",
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

function createStackedChart(data) {
  let labels = [];
  data.forEach((element) => {
    labels.push(element._id.year);
  });
  labels = [...new Set(labels)];
  labels.sort((a, b) => {
    return b - a;
  });

  let groupedByMonth = data.reduce((r, a) => {
    r[a._id.month] = [...(r[a._id.month] || []), a];
    return r;
  }, {});

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const colours = [
    "rgba(255, 99, 132, 0.2)",
    "rgba(255, 159, 64, 0.2)",
    "rgba(255, 205, 86, 0.2)",
    "rgba(75, 192, 192, 0.2)",
    "rgba(54, 162, 235, 0.2)",
    "rgba(153, 102, 255, 0.2)",
    "rgba(201, 203, 207, 0.2)",
    "rgb(255, 99, 132)",
    "rgb(75, 192, 192)",
    "rgb(255, 205, 86)",
    "rgb(201, 203, 207)",
    "rgb(54, 162, 235)",
  ];

  let datasets = [];

  months.forEach((e, index) => {
    let body = {};
    body.label = months[index];
    let dataMonth = groupedByMonth[index + 1];
    let points = [];

    if (!dataMonth) {
      body.data = [];
      body.backgroundColor = colours[index];
    } else {
      labels.forEach((e, index) => {
        let filteredData = dataMonth.filter((d) => d._id.year === e);
        if (filteredData.length === 0) {
          points[index] = 0;
        } else {
          points[index] = filteredData[0].countMeetings;
        }
      });

      body.data = points;
      body.backgroundColor = colours[index];
    }
    datasets.push(body);
  });

  const ctx = document.getElementById("stackedChart").getContext("2d");
  stackedchart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: datasets,

      // datasets: [
      //   {
      //     label: "Januray",
      //     data: [9, 10, 20],
      //     backgroundColor: "rgb(75, 192, 192)",
      //   },
      //   {
      //     label: "Febraury",
      //     data: [6, 13, 2],
      //     backgroundColor: "rgb(255, 99, 132)",
      //   },
      // {
      //   label: "March",
      //   data: { 2021: 9 },
      //   backgroundColor: "rgba(255, 99, 132, 0.2)",
      // },
      // {
      //   label: "Januray",
      //   data: { 2022: 1 },
      //   backgroundColor: "rgb(75, 192, 192)",
      // },
      // {
      //   label: "Febraury",
      //   data: { 2022: 3 },
      //   backgroundColor: "rgb(255, 99, 132)",
      // },
      // {
      //   label: "March",
      //   data: { 2022: 20 },
      //   backgroundColor: "rgba(255, 99, 132, 0.2)",
      // },
      // ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: "Monthly and Yearly Completed Meetings",
        },
      },
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    },
  });
}
