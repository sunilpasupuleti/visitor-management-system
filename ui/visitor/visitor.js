let data = localStorage.getItem("visitor-data");
data = JSON.parse(window.atob(data));
if (!data || data.role !== "visitor") {
  location.href = "/";
} else {
  hideLoader();
  $("#name").html(data.name);
  $("#selfieImage").attr("src", data.selfieLink);
  $(".details-panel").show();
  $(".meeting-panel").hide();
  fetchEmployeesData();
}

var members = [];
let employees = [];
let filterEmployees;

function addMember() {
  $("#error-msg").html("");
  var nameField = $("#mem-name");
  var phoneField = $("#mem-phone");
  var name = nameField.val();
  var phone = phoneField.val();
  if (!name) {
    $("#error-msg").html("Name required");
    return;
  }
  members.push({
    name,
    phone,
  });
  nameField.val("");
  phoneField.val("");
  $("#addMemberModal").modal("hide");
  renderMembers();
}

function renderMembers() {
  var membersContainer = $(".members");
  membersContainer.html("");
  members.forEach((member, index) => {
    var html = `<div class="member">
        <h3><span>${index + 1} . </span>${member.name}</h3>
        <p>${member.phone}</p>
        <i onclick="deleteMember('${index}')" class="fas fa-trash fa-sm delete-icon"></i>
      </div>
      `;
    membersContainer.append(html);
  });
}

function deleteMember(index) {
  members = members.filter((m, i) => i != index);
  renderMembers();
}

async function fetchEmployeesData() {
  showLoader();

  const api_url = URL + "/visitor/getEmployees";

  var result = await sendRequest("GET", api_url);
  if (result) {
    employees = result.employees;
    filterEmployees = result.employees;
    buildclientTable();
    hideLoader();
  } else {
    hideLoader();
  }
}

async function buildclientTable() {
  let tableBody = $(".employees-list");
  tableBody.empty();
  if (employees.length == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No Employees Data Available</h2>'
    );
  } else {
    // console.log(tableData)
    let employeeCount = 0;
    employees.forEach(async (employee) => {
      employeeCount += 1;
      const {
        _id,
        name,
        email,
        department,
        designation,
        isOnVacationMode,
        image,
      } = employee;

      let tablerow = `
        <tr class='cp ${
          isOnVacationMode ? "disabled" : ""
        }' onclick="onScheduleMeeting('${_id}')">
        <th >
          ${employeeCount}
        </th>
        <td class='table-preview-img' onclick="onOpenImage('${image.url}')">
        <img src='${image.url}' alt='selfie'>
        </td>
        <th  >${name}</th>
        <td  >${department}</td>
        <td  >${designation}</td>
        <td  >${email}</td>
        <td class='vacation' >${isOnVacationMode ? "YES" : "NO"}</td>
      </tr>
        `;
      tableBody.append(tablerow);
    });
  }
}
function onChangeDetails() {
  $(".meeting-panel").hide();
  $(".details-panel").show();
}
function onScheduleNow(e) {
  e.preventDefault();
  var purpose = $("#purpose").val();
  if (!purpose) {
    showError("Prupose required");
    return;
  }
  $(".details-panel").hide();
  $(".meeting-panel").show();
}

async function onScheduleMeeting(employeeId) {
  let employee = employees.filter((e) => e._id === employeeId)[0];
  if (employee.isOnVacationMode || employee.status === "disabled") {
    showError("Selected employee is unavailable to take the meeting!");
    return;
  }
  var purpose = $("#purpose").val();
  var vehicleNumber = $("#veh-num").val();
  let otherBelongings = [];
  var inputElements = document.getElementsByClassName("belongings");
  for (var i = 0; inputElements[i]; ++i) {
    if (inputElements[i].checked) {
      otherBelongings.push(inputElements[i].value);
    }
  }

  if (!purpose) {
    showError("Prupose required");
    return;
  }

  const api_url = URL + "/meeting/requestForMeetingWeb";
  var result = await sendRequest("POST", api_url, {
    empId: employeeId,
    additionalMembers: members,
    purpose: purpose,
    vehicleNumber: vehicleNumber,
    otherBelongings: otherBelongings,
  });
  if (result) {
    hideLoader();
    swal({
      title: "Scheduled",
      text: result.message,
      type: "success",
      icon: "success",
    }).then(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("visitor-data");
      location.href = "/visitor/register/?company_id=" + result.companyId;
    });

    // showSuccess(result.message);
  } else {
    hideLoader();
  }
}

function onOpenImage(url) {
  window.open(url, "__blank");
}

let timer;
async function searchFilter(e) {
  employees = filterEmployees;
  let filteredData;
  let searchText = e.target.value.toLowerCase().trim();
  if (searchText.length === 0) {
    employees = filterEmployees;
    buildclientTable();
    return;
  }

  clearTimeout(timer);

  timer = setTimeout(async () => {
    filteredData = await employees.filter((employee) => {
      let e = employee;
      return (
        e.name.toLowerCase().includes(searchText) ||
        e.department.toLowerCase().includes(searchText) ||
        e.designation.toLowerCase().includes(searchText) ||
        e.email.toLowerCase().includes(searchText)
      );
    });

    employees = filteredData;
    buildclientTable();
  }, 500);
}

function showError(message, title = "Error") {
  swal({
    title: title,
    text: message,
    type: "error",
    icon: "error",
  }).then(() => {});
}

renderMembers();
// console.log(data);
// let payload;
// if (data) {
//   payload = data.split(".")[1];
//   payload = JSON.parse(window.atob(payload));
//   payload = payload.visitor;
// } else {
//   payload = null;
// }

// console.log(payload);
// if (data.role != "visitor") {
//   location.href = "/";
// }
