hideLoader();
users = [];
filterUsers = [];
let s = 0;
let si = 10;
preventRoute("Super Admin");

async function fetchUsers() {
  showLoader();
  const api_url = URL + "/company/get-users";
  var result = await sendRequest("GET", api_url);
  if (result) {
    users = result.users;
    filterUsers = result.users;
    buildclientTable();
  }
}

async function buildclientTable() {
  let tableBody = $(".users-list");
  tableBody.empty();
  if (users.length == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No Users Data Available</h2>'
    );
  } else {
    // console.log(tableData)
    const filUsers = users.slice(s, si);
    let userCount = 0;
    filUsers.forEach(async (user) => {
      userCount += 1;
      const { _id, name, company, password, email, createdAt } = user;

      var date = moment(createdAt);
      var expiryTime = date.format("MMM DD , YYYY");

      let tablerow = `
          <tr>
          <th>
        ${userCount}
          </th>
          <td>${name}</td>
          <td>${email}</td>
          <td>${password}</td>
          <td>${company.name}</td>
          <td>${moment(createdAt).format("MMM DD , YYYY")}</td>

          <td>
          <button class='btn btn-secondary btn-sm'  onclick="openEditModal('${_id}')">Edit</button>
          <button class='btn btn-danger btn-sm'  onclick="deleteUser('${_id}' )">Delete</button>
            
        </td>
          `;
      tableBody.append(tablerow);
    });
  }
  hideLoader();
}

async function onAddUser(e) {
  showLoader();
  e.preventDefault();
  showLoader();
  let name = $("#usr-name").val();
  let email = $("#usr-email").val();
  let password = $("#usr-pwd").val();
  let companyId = $("#usr-comp").val();
  if (name === "" || email === "" || password === "" || companyId === "") {
    hideLoader();
    $("#error-msg").text("All fields required");
    return;
  }

  let company = companies.filter((c) => c._id === companyId)[0];
  if (!company) {
    hideLoader();
    $("#error-msg").text("Invalid company id");
  }

  const body = {
    name,
    email,
    password,
    company,
  };
  var api_url = URL + "/company/create-user";
  var result = await sendRequest("POST", api_url, body);
  if (result) {
    swal({
      title: "Added",
      text: `${result.message}`,
      type: "success",
      icon: "success",
    }).then(() => {
      location.href = "users.html";
    });
  }
}

function openEditModal(userId) {
  $("#editUserModal").modal("show");
  const user = users.filter((e) => e._id === userId)[0];
  $("#edit-usr-name").val(user.name);
  $("#edit-usr-email").val(user.email);
  $("#edit-usr-pwd").val(user.password);
  addDropdown("edit-usr-comp");
  $("#edit-usr-comp").val(user.company._id);
  $("#edit-usr-id").val(user._id);
}

async function onEditUser(e) {
  e.preventDefault();
  showLoader();
  let name = $("#edit-usr-name").val();
  let email = $("#edit-usr-email").val();
  let password = $("#edit-usr-pwd").val();
  let company = $("#edit-usr-comp").val();
  let userId = $("#edit-usr-id").val();

  if (
    name === "" ||
    email === "" ||
    password === "" ||
    company === "" ||
    userId === ""
  ) {
    hideLoader();
    $("#error-msg").text("All fields required");
    return;
  }

  const body = {
    name,
    email,
    password,
    company,
    Id: userId,
  };

  const api_url = URL + "/company/update-user";
  var result = await sendRequest("PUT", api_url, body);

  if (result) {
    swal({
      title: "Updated",
      text: `${result.message}`,
      type: "success",
      icon: "success",
    }).then(() => {
      $("#editCompanyModal").modal("hide");
      hideLoader();
      location.href = "users.html";
    });
  }
}

async function deleteUser(userId) {
  swal({
    title:
      "Are you sure you want to delete the user and all realted information ? ",
    text: "You won't be able to revert this!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then(async (result) => {
    if (result) {
      const api_url = URL + "/company/delete-user?id=" + userId;
      var result = await sendRequest("DELETE", api_url);
      if (result) {
        swal({
          title: "DELETED",
          text: `${result.message}`,
          type: "success",
          icon: "success",
        }).then(() => {
          hideLoader();
          location.href = "users.html";
        });
      }
    }
  });

  showLoader();
}

function next() {
  if (s >= 0 && s < users.length - 10) {
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
  users = filterUsers;
  let filteredData;
  let searchText = e.target.value.toLowerCase().trim();
  if (searchText.length === 0) {
    users = filterUsers;
    buildclientTable();
    return;
  }

  clearTimeout(timer);

  timer = setTimeout(async () => {
    filteredData = await users.filter((user) => {
      let e = user;
      return (
        e.name.toLowerCase().includes(searchText) ||
        e.email.toLowerCase().includes(searchText) ||
        e.password.toLowerCase().includes(searchText) ||
        e.company.name.toLowerCase().includes(searchText) ||
        moment(e.createdAt)
          .format("MMM DD , YYYY")
          .toLowerCase()
          .includes(searchText)
      );
    });

    users = filteredData;
    buildclientTable();
  }, 500);
}

let companies;
async function getCompanies() {
  showLoader();
  const api_url = URL + "/company/get-companies";
  var result = await sendRequest("GET", api_url);
  if (result) {
    companies = result.companies;
    addDropdown("usr-comp");
    hideLoader();
  }
}
function addDropdown(id) {
  var html = ``;
  companies.forEach((element) => {
    html += ` <option value="${element._id}" >${element.name}</option>`;
  });
  $("#" + id).append(html);
}

getCompanies();
fetchUsers();
