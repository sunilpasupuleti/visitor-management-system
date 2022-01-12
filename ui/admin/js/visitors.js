/* Current page number which has to be sent to server */
preventRoute("Admin");
let s = 0;
let si = 10;

let visitors = [];
let filterVisitors;
async function fetchUserData() {
  showLoader();

  const api_url = URL + "/visitor/getVisitors";

  var result = await sendRequest("GET", api_url);
  if (result) {
    visitors = result.visitors;
    filterVisitors = result.visitors;
    buildclientTable();
    hideLoader();
  }
}

fetchUserData();

async function buildclientTable() {
  let tableBody = $(".visitors-list");
  tableBody.empty();
  if (visitors.length == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No Visitors Data Available</h2>'
    );
  } else {
    // console.log(tableData)
    const filVisitors = visitors.slice(s, si);
    let visitorCount = 0;
    filVisitors.forEach(async (visitor) => {
      visitorCount += 1;
      const {
        _id,
        name,
        phone,
        email,
        totalMeetingsDone,
        company,
        area,
        address,
        idLink,
        idType,
        selfieLink,
      } = visitor;

      let tablerow = `
        <tr class='cp'>
        <th  onclick="onNavigate('${_id}')">
          ${visitorCount}

        </th>
        <td class='table-preview-img' onclick="onOpenImage('${selfieLink}')">
        <img src='${selfieLink}' alt='selfie'>
        </td>
        <td  onclick="onNavigate('${_id}')">${name}</td>
        <td  onclick="onNavigate('${_id}')">${phone}</td>
        <td  onclick="onNavigate('${_id}')">${totalMeetingsDone}</td>
        <td  onclick="onNavigate('${_id}')">${address}</td>
        <td>
        <a style="cursor:pointer; color:#0341fc;" href='${idLink}' target='__blank'>${idType}</a>
        </td>
        `;
      tableBody.append(tablerow);
    });
  }
}
function onNavigate(id) {
  location.href = "visitor_profile.html?visitorId=" + id;
}

function onOpenImage(url) {
  window.open(url, "__blank");
}

function next() {
  if (s >= 0 && s < visitors.length - 10) {
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
  visitors = filterVisitors;
  let filteredData;
  let searchText = e.target.value.toLowerCase().trim();
  if (searchText.length === 0) {
    visitors = filterVisitors;
    buildclientTable();
    return;
  }

  clearTimeout(timer);

  timer = setTimeout(async () => {
    filteredData = await visitors.filter((visitor) => {
      let e = visitor;
      return (
        e.name.toLowerCase().includes(searchText) ||
        e.phone.includes(searchText) ||
        e.totalMeetingsDone.toString().includes(searchText) ||
        e.address.toLowerCase().includes(searchText) ||
        e.idType.toLowerCase().includes(searchText)
      );
    });

    visitors = filteredData;
    buildclientTable();
  }, 500);
}
