preventRoute("Super Admin");

hideLoader();
companies = [];
filterCompanies = [];
let s = 0;
let si = 10;

async function fetchCompanies() {
  showLoader();
  const api_url = URL + "/company/get-companies";
  var result = await sendRequest("GET", api_url);
  if (result) {
    companies = result.companies;
    filterCompanies = result.companies;
    buildclientTable();
  }
}

async function buildclientTable() {
  let tableBody = $(".companies-list");
  tableBody.empty();
  if (companies.length == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No Companies Data Available</h2>'
    );
  } else {
    // console.log(tableData)
    const filCompanies = companies.slice(s, si);
    let companyCount = 0;
    filCompanies.forEach(async (company) => {
      companyCount += 1;
      const { _id, name, address, expiresAt } = company;

      var date = moment(expiresAt);
      var expiryTime = date.format("MMM DD , YYYY");

      let tablerow = `
          <tr>
          <th>
        ${companyCount}
          </th>
          <td>${name}</td>
          <td>${address}</td>
          <td>${expiryTime}</td>
          <td>
          <button class='btn btn-secondary btn-sm'  onclick="openEditModal('${_id}')">Edit</button>
          <button class='btn btn-danger btn-sm'  onclick="deleteCompany('${_id}' )">Delete</button>
            
        </td>
          `;
      tableBody.append(tablerow);
    });
  }
  hideLoader();
}

async function onAddCompany(e) {
  e.preventDefault();
  showLoader();
  let name = $("#com-name").val();
  let address = $("#com-add").val();
  let expiresAt = $("#com-lic").val();

  if (name === "" || address === "" || !expiresAt) {
    hideLoader();
    $("#error-msg").text("All fields required");
    return;
  }

  hideLoader();
  const body = {
    name,
    address,
    expiresAt,
  };
  var api_url = URL + "/company/create-company";
  var result = await sendRequest("POST", api_url, body);
  if (result) {
    swal({
      title: "Added",
      text: `${result.message}`,
      type: "success",
      icon: "success",
    }).then(() => {
      location.href = "companies.html";
    });
  }
}

function openEditModal(comId) {
  $("#editCompanyModal").modal("show");
  const company = companies.filter((e) => e._id === comId)[0];
  console.log(company);
  $("#edit-com-name").val(company.name);
  $("#edit-com-add").val(company.address);
  $("#edit-com-lic").val(moment(company.expiresAt).format("YYYY-MM-DD"));
  $("#edit-com-id").val(company._id);
}

async function onEditCompany(e) {
  e.preventDefault();
  showLoader();
  let name = $("#edit-com-name").val();
  let address = $("#edit-com-add").val();
  let expiresAt = $("#edit-com-lic").val();
  let comId = $("#edit-com-id").val();

  if (name === "" || address === "" || !expiresAt || comId === "") {
    hideLoader();
    $("#error-msg").text("All fields required");
    return;
  }

  const body = {
    name,
    address,
    expiresAt,
    Id: comId,
  };

  const api_url = URL + "/company/update-company";
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
      location.href = "companies.html";
    });
  }
}

async function deleteCompany(comId) {
  swal({
    title:
      "Are you sure you want to delete the company and realted information ? ",
    text: "You won't be able to revert this!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then(async (result) => {
    if (result) {
      const api_url = URL + "/company/delete-company?id=" + comId;
      var result = await sendRequest("DELETE", api_url);
      if (result) {
        swal({
          title: "DELETED",
          text: `${result.message}`,
          type: "success",
          icon: "success",
        }).then(() => {
          hideLoader();
          location.href = "companies.html";
        });
      }
    }
  });
}

function next() {
  if (s >= 0 && s < companies.length - 10) {
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
  companies = filterCompanies;
  let filteredData;
  let searchText = e.target.value.toLowerCase().trim();
  if (searchText.length === 0) {
    companies = filterCompanies;
    buildclientTable();
    return;
  }

  clearTimeout(timer);

  timer = setTimeout(async () => {
    filteredData = await companies.filter((company) => {
      let e = company;
      return (
        e.name.toLowerCase().includes(searchText) ||
        e.address.includes(searchText) ||
        moment(e.expiresAt)
          .format("MMM DD , YYYY")
          .toLowerCase()
          .includes(searchText)
      );
    });

    companies = filteredData;
    buildclientTable();
  }, 500);
}

fetchCompanies();
