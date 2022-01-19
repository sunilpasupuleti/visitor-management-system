// var jwtToken = localStorage.getItem("jwtToken");
// var username = localStorage.getItem("username");

// $(".profile-username").html(username);

async function rangeData() {
  var from = document.getElementById("from_date").value;
  var to = document.getElementById("to_date").value;
  from = new Date(from).getTime();

  var custom = true;

  let data = getPayload();
  var api_url;

  to = new Date(to).getTime();

  if (data.role === "Super Admin") {
    api_url =
      "/admin/dashboard?custom=" +
      custom +
      "&startTime=" +
      from +
      "&endTime=" +
      to +
      "&company=" +
      presentCompany._id;
  } else {
    api_url =
      "/admin/dashboard?custom=" +
      custom +
      "&startTime=" +
      from +
      "&endTime=" +
      to;
  }
  var url = URL + api_url;
  if (!from || !to) {
    alert("Please selct from and to range");
  } else {
    showLoader();
    var result = await sendRequest("GET", url);
    if (result) {
      console.log("custon data", result);
      destroyCharts();
      updateMeetingsData(result);
      updateDetailsCard(result);
      createChart(result);
      createCompletedChart(result);
      createRejectedChart(result);
      createEmpVisChart(result);
      bestEmployeeChart(result);
      hideLoader();
    }
  }
}

let companies = [];

let presentCompany;

async function onChangeCompany(e) {
  var data = companies.filter((c) => c._id === e.target.value)[0];
  presentCompany = data;
  destroyCharts();
  getDashboardData();
}

async function fetchCompanies() {
  showLoader();
  const api_url = URL + "/company/get-companies";
  var result = await sendRequest("GET", api_url);
  if (result) {
    companies = result.companies;
    if (result && result.companies) {
      presentCompany = companies[0];
      let compDropdown = $("#companies");
      result.companies.forEach((element) => {
        let option = `<option value='${element._id}'>${element.name}</option>`;
        compDropdown.append(option);
      });
      getDashboardData();
    }
  }
}

function destroyCharts() {
  completedmeetingschart.destroy();
  rejectedmeetingschart.destroy();
  empvischart.destroy();
  bestempchart.destroy();
  dashboardchart.destroy();
}

async function getDashboardData() {
  let data = getPayload();
  var api_url;
  if (data.role === "Super Admin") {
    if (presentCompany) {
      api_url = "/admin/dashboard?company=" + presentCompany._id;
    }
  } else {
    api_url = "/admin/dashboard";
  }
  if (presentCompany) {
    if (data.company) {
      $(".company-name").html(data.company.name);
    } else {
      $(".company-name").html(presentCompany.name);
    }
  }
  var result = await sendRequest("GET", URL + api_url);
  if (result) {
    updateMeetingsData(result);
    updateBestEmployeeTable(result);
    updateDetailsCard(result);
    createChart(result);
    createCompletedChart(result);
    createRejectedChart(result);
    createEmpVisChart(result);
    bestEmployeeChart(result);
    hideLoader();
  }
  // let data = await response.json();
  // console.log(data);
}
fetchCompanies();

/* Update invoices,payouts and orders cards */
function updateMeetingsData(meetingsData) {
  const {
    currentMeetingsOnSite,
    upComingMeetingsToday,
    totalMeetingsDone,
    totalMeetingsDoneLength,
    totalRejectedMeetingsDoneLength,
    totalRescheduledMeetingsDoneLength,
    totalRejectedMeetings,
    totalVisitors,
    totalEmployees,
    employeeListSortedByMeetings,
  } = meetingsData;

  updateCompletedMeetings(totalMeetingsDone);
  updateRejectedMeetings(totalRejectedMeetings);
}

function updateBestEmployeeTable(data) {
  let sortedList = data.employeeListSortedByMeetings;
  let tableBody = $(".best-employee-count");
  tableBody.empty();
  if (sortedList.lengt == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No Best Employee Found</h2>'
    );
  } else {
    let idCount = 0;
    sortedList.forEach(async (m) => {
      idCount += 1;

      let tablerow = `
          <tr>
          <th>
          <a  style="cursor:pointer; color:#0341fc;" href="#">${idCount}</a>
          </th>
         
          <th>
          <a  style="cursor:pointer; color:#0341fc;" href="employee_profile.html?employeeId=${m.empId._id}">${m.emp.name}</a>
          </th>
          <td>${m.emp.email}</td>
          <td>${m.count}</td>
         </tr>
          `;
      tableBody.append(tablerow);
    });
  }
}

function updateDetailsCard(data) {
  $("#total-meetings-done").html(data.totalMeetingsDoneLength);

  $("#total-rejected-meetings").html(data.totalRejectedMeetingsDoneLength);

  $("#total-rescheduled-meetings").html(
    data.totalRescheduledMeetingsDoneLength
  );

  $("#current-meetings-on-site").html(data.currentMeetingsOnSite);

  $("#today-upcoming-meetings").html(data.upComingMeetingsToday);

  $("#total-visitors").html(data.totalVisitors);

  $("#total-employees").html(data.totalEmployees);
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

function updateCompletedMeetings(meetings) {
  const v = returnValues(meetings);
  $("#T-completed-meetings").html(v.day.count);

  $("#W-completed-meetings").html(v.week.count);

  $("#M-completed-meetings").html(v.month.count);

  $("#Y-completed-meetings").html(v.year.count);
}

function updateRejectedMeetings(meetings) {
  const v = returnValues(meetings);

  $("#T-rejected-meetings").html(v.day.count);

  $("#W-rejected-meetings").html(v.week.count);

  $("#M-rejected-meetings").html(v.month.count);

  $("#Y-rejected-meetings").html(v.year.count);
}

function displayTab(tab) {
  var tabName = "";
  $(".invoice-pill ").hasClass("active")
    ? (tabName = `${tab.name}invoices`)
    : (tabName = `${tab.name}payouts`);
  let tabType = tabName.slice(2);
  // console.log(tabName, tabType);

  $(`.${tabType}`).css("display", "none");
  $(`#${tabName}`).css("display", "block");
  $(`.${tabType}-tab`).removeClass("active");
  $(this).addClass("active");
}

function displayMeetings(meeting) {
  var tabName = meeting.name;
  let tabType = tabName.slice(2);
  $(`.${tabType}`).css("display", "none");
  $(`#${tabName}`).css("display", "block");
  $(`.${tabType}-tab`).removeClass("active");
  $(this).addClass("active");
}

let dashboardchart,
  completedmeetingschart,
  rejectedmeetingschart,
  empvischart,
  bestempchart;

function createChart(data) {
  const ctx = document.getElementById("dashboardChart").getContext("2d");
  dashboardchart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Rescheduled", "Upcoming", "Current", "Rejected", "Completed"],

      datasets: [
        {
          label: "No of meetings",
          data: [
            data.totalRescheduledMeetingsDoneLength,
            data.upComingMeetingsToday,
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

function createRejectedChart(data) {
  const v = returnValues(data.totalRejectedMeetings);
  const ctx = document
    .getElementById("dashboardRejectedChart")
    .getContext("2d");
  rejectedmeetingschart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Today", "This Week", "This Month", "This Year"],
      datasets: [
        {
          label: "No of Rejected Meetings",
          data: [v.day.count, v.week.count, v.month.count, v.year.count],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(255, 159, 64, 0.2)",
            "rgba(255, 205, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
          ],
          borderColor: [
            "rgb(255, 99, 132)",
            "rgb(255, 159, 64)",
            "rgb(255, 205, 86)",
            "rgb(75, 192, 192)",
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

function createEmpVisChart(data) {
  const ctx = document.getElementById("empVisChart").getContext("2d");
  empvischart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Visitors", "Employees"],
      datasets: [
        {
          label: "No of people",
          data: [data.totalVisitors, data.totalEmployees],
          backgroundColor: [
            "rgba(153, 102, 255, 0.2)",
            "rgba(201, 203, 207, 0.2)",
          ],
          borderColor: ["rgb(153, 102, 255)", "rgb(201, 203, 207)"],
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

function bestEmployeeChart(data) {
  const ctx = document.getElementById("bestEmpChart").getContext("2d");
  let labels = [],
    values = [];
  data.employeeListSortedByMeetings.forEach((element) => {
    labels.push(element.emp.name);
    values.push(element.count);
  });
  bestempchart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Employees by high number of meetings",
          data: values,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
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
