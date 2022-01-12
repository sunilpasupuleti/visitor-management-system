/* Current page number which has to be sent to server */
preventRoute("Admin");
let s = 0;
let si = 10;
var storage = firebase.storage();
let employees;
let filterEmployees;

let changedEmpImage = false;

async function getDepartments() {
  var api_url = URL + "/admin/getDepartments";
  var result = await sendRequest("GET", api_url);
  if (result) {
    let addEmpModal = $("#emp-dept");
    let editEmpModal = $("#edit-emp-dept");
    if (result && result.departments) {
      result.departments.departments.forEach((element) => {
        let option = `<option value='${element}'>${element}</option>`;
        addEmpModal.append(option);
        editEmpModal.append(option);
      });
    }
  }
}

$(document).ready(function () {
  $("#editEmployeeModal").on("hide.bs.modal", function () {
    changedEmpImage = false;
  });
});

function showPreview(e, className) {
  if (className === "edit-emp-img-preview") {
    changedEmpImage = true;
  }
  console.log(e.target.files[0]);
  if (e.target.files.length > 0) {
    var reader = new FileReader();
    reader.onload = () => {
      var output = document.getElementsByClassName(className);
      $("." + className).attr("src", reader.result);
      $("." + className).css("visibility", "visible");
    };
    reader.readAsDataURL(e.target.files[0]);
  }
}

getDepartments();

async function onAddEmployee(e) {
  showLoader();
  e.preventDefault();

  let name = $("#emp-name").val();
  let phone = $("#emp-phn").val();
  let email = $("#emp-email").val();
  let password = $("#emp-pwd").val();
  let title = $("#emp-title").val();
  let department = $("#emp-dept").val();
  let file = document.getElementById("emp-img");
  if (
    name === "" ||
    phone === "" ||
    email === "" ||
    password === "" ||
    title === "" ||
    department === "" ||
    file.files.length === 0
  ) {
    $("#error-msg").html("Fill in all fields with image");
    hideLoader();
    return;
  }

  if (phone.length !== 10) {
    $("#error-msg").html("Invalid mobile number");
    return;
  }

  $("#error-msg").html("");
  var fileName = new Date().getTime().toString() + "_" + file.files[0].name;
  var upload = storage.ref(`/profile-images/${fileName}`).put(file.files[0]);

  upload.on(
    "state_changed",
    function (snapshot) {},
    function (error) {
      console.log(error);
      swal({
        title: "Error",
        text: `${error}`,
        type: "error",
        icon: "error",
      });
      hideLoader();
      return;
    },
    function complete() {
      upload.snapshot.ref.getDownloadURL().then(async function (downloadURL) {
        const body = {
          name,
          email,
          phone,
          password,
          department,
          title,
          image: { name: fileName, url: downloadURL },
        };
        var api_url = URL + "/employee/addEmployee";
        var result = await sendRequest("POST", api_url, body);
        if (result) {
          $("#employeeModal").modal("hide");
          hideLoader();
          swal({
            title: "Added",
            text: `${result.message}`,
            type: "success",
            icon: "success",
          }).then(() => {
            location.href = "employees.html";
          });
        }
      });
    }
  );
}

async function fetchUserData() {
  showLoader();
  const api_url = URL + "/employee/getEmployees";
  var result = await sendRequest("GET", api_url);
  if (result) {
    employees = result.employees;
    filterEmployees = result.employees;
    buildclientTable();
    hideLoader();
  }
}

fetchUserData();

function openEditModal(empId) {
  $("#editEmployeeModal").modal("show");
  const employee = employees.filter((e) => e._id === empId)[0];
  console.log(employee);
  $("#edit-emp-name").val(employee.name);
  $("#edit-emp-phn").val(employee.phone);
  $("#edit-emp-email").val(employee.email);
  $("#edit-emp-pwd").val(employee.password);
  $("#edit-emp-title").val(employee.title);

  $(".edit-emp-img-preview").attr("src", employee.image.url);
  $(".edit-emp-img-preview").css("visibility", "visible");

  $("#edit-emp-dept").val(employee.department);
  $("#edit-emp-uid").val(employee.uid);
  $("#edit-emp-id").val(employee._id);
}

async function onEditEmployee(e) {
  e.preventDefault();
  showLoader();

  let name = $("#edit-emp-name").val();
  let phone = $("#edit-emp-phn").val();
  let email = $("#edit-emp-email").val();
  let password = $("#edit-emp-pwd").val();
  let title = $("#edit-emp-title").val();
  let department = $("#edit-emp-dept").val();
  let uid = $("#edit-emp-uid").val();
  let empId = $("#edit-emp-id").val();
  if (
    name === "" ||
    phone === "" ||
    email === "" ||
    password === "" ||
    title === "" ||
    department === "" ||
    uid === "" ||
    empId === ""
  ) {
    $("#error-msg").html("Fill in all fields with image");
    hideLoader();
    return;
  }

  if (phone.length !== 10) {
    $("#error-msg").html("Invalid mobile number");
    return;
  }

  $("#error-msg").html("");
  const body = {
    name,
    phone,
    email,
    password,
    title,
    department,
    uid,
    empId,
    changedEmpImage,
  };

  if (changedEmpImage) {
    let file = document.getElementById("edit-emp-img");
    var fileName = new Date().getTime().toString() + "_" + file.files[0].name;
    var upload = storage.ref(`/profile-images/${fileName}`).put(file.files[0]);
    upload.on(
      "state_changed",
      function (snapshot) {},
      function (error) {
        console.log(error);
        return;
      },
      function complete() {
        upload.snapshot.ref.getDownloadURL().then(async function (downloadURL) {
          body.image = { name: fileName, url: downloadURL };
          const api_url = URL + "/employee/editEmployee";
          var result = await sendRequest("PUT", api_url, body);

          if (result) {
            swal({
              title: "Updated",
              text: `${result.message}`,
              type: "success",
              icon: "success",
            }).then(() => {
              $("#editEmployeeModal").modal("hide");
              hideLoader();
              location.href = "employees.html";
            });
          }
        });
      }
    );
  } else {
    const api_url = URL + "/employee/editEmployee";
    var result = await sendRequest("PUT", api_url, body);

    if (result) {
      swal({
        title: "Updated",
        text: `${result.message}`,
        type: "success",
        icon: "success",
      }).then(() => {
        $("#editEmployeeModal").modal("hide");
        hideLoader();
        location.href = "employees.html";
      });
    }
  }
}

async function deleteEmployee(empId, uid) {
  if (window.confirm("Are you sre want to delete employee ?")) {
    showLoader();
    const api_url =
      URL + "/employee/deleteEmployee?employeeId=" + empId + "&uid=" + uid;
    var result = await sendRequest("DELETE", api_url);
    if (result) {
      swal({
        title: "DELETED",
        text: `${result.message}`,
        type: "success",
        icon: "success",
      }).then(() => {
        hideLoader();
        location.href = "employees.html";
      });
    }
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
    const filEmployees = employees.slice(s, si);
    let employeeCount = 0;
    filEmployees.forEach(async (employee) => {
      employeeCount += 1;
      const {
        _id,
        name,
        phone,
        email,
        password,
        uid,
        totalMeetingsDone,
        department,
        title,
        isOnVacationMode,
        image,
      } = employee;

      let tablerow = `
          <tr class='cp' >
         
       
          <th  onclick="onNavigate('${_id}')">
            <a  style="cursor:pointer; color:#0341fc;" >${employeeCount}</a>
          </th>
          <td  onclick="onNavigate('${_id}')">${name}</td>
      
          <td class='table-preview-img' onclick="onOpenImage('${image.url}')">
          <img src='${image.url}'>
          </td>
      
            <td onclick="onNavigate('${_id}')">${title}</td>
            <td onclick="onNavigate('${_id}')">${phone}</td>
            <td onclick="onNavigate('${_id}')">${email}</td>
            <td onclick="onNavigate('${_id}')">${password}</td>
            <td onclick="onNavigate('${_id}')">${department}</td>
            <td onclick="onNavigate('${_id}')">${totalMeetingsDone}</td>
            <td onclick="onNavigate('${_id}')">${isOnVacationMode}</td>
       
          <td>
            <button class='btn btn-secondary btn-sm'  onclick="openEditModal('${_id}')">Edit</button>
            <button class='btn btn-danger btn-sm'  onclick="deleteEmployee('${_id}' , '${uid}')">Delete</button>

              
          </td>
          </tr>
          `;
      tableBody.append(tablerow);
    });
    /* Display buttons */
    //getPageButtons(pageCount);
  }
}

function onNavigate(id) {
  location.href = "employee_profile.html?employeeId=" + id;
}

function onOpenImage(url) {
  window.open(url, "_blank");
}

function next() {
  if (s >= 0 && s < employees.length - 10) {
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
        e.phone.toLowerCase().includes(searchText) ||
        e.email.toLowerCase().includes(searchText) ||
        e.title.toLowerCase().includes(searchText) ||
        e.password.toLowerCase().includes(searchText) ||
        e.department.toString().includes(searchText) ||
        e.totalMeetingsDone.toString().toLowerCase().includes(searchText) ||
        e.isOnVacationMode.toString().includes(searchText)
      );
    });

    employees = filteredData;
    buildclientTable();
  }, 500);
}
