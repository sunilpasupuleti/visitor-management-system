/* Current page number which has to be sent to server */
let reqData = {
  currentPageNumber: 0,
};



function notery_list() {
  /* Using Temporary api call , replacw with proper api call */
  fetch(`https://api.notarizetech.com/admin/notary/getNotariesPendingApproval`, {
      method: "POST",
      body: JSON.stringify({
        pageNumber: reqData.currentPageNumber
      }),
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": "Bearer " + localStorage.getItem("token")

      },
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      if (!response.status) {
        swal({
          text: `${response.message}`,
          type: "error",
          icon: "error"
        })
      }
      console.log(response);
      /* function to render table */
      var notary_count = document.getElementById("notary_count")
      notary_count.innerText = response.notaryCount
      buildnoteryTable(response);
      hideLoader()
    })
    .catch((err) => {
      swal({
        title: "Oops",
        text: `Error in fetching Data Refresh Page`,
        type: "error",
        icon: "error"
      }).then(()=>window.location.reload())
    })
}

notery_list();

function buildnoteryTable(tableData) {
  console.log(tableData)
  let tableBody = $(".notery-list");
  tableBody.empty();
  const {
    pageCount,
    orderCount,
    pageNumber,
    notaries
  } = tableData;
  if (notaries.length == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No Any Data Available</h2>'
    );
  } else {
    var count = 0
    notaries.forEach((notary) => {
      count += 1
      let tablerow = `
      <tr>
            <th>#${count}</th>
            <td><img src="${notary.userImageURL}" class="avatar rounded-circle" style="width:2rem; height:2rem;"><span class="form-control-label ml-2">${notary.firstName} ${notary.lastName}</span></td>
            <th>
                <a style="cursor:pointer; color:#0341fc;" href="notery_details.html?notaryId=${notary._id}">View Details</a>
            </th>
            <td>
                <button id="app_${notary._id}" type="button" class="btn btn-success input-group my-4 text-center" onclick="approve_notery('${notary._id}')" style="width:15rem;">
                    <span class="mx-auto">Approve</span>
                </button>
            </td>
            <td>
             <button id="rej_${notary._id}" type="button" class="btn btn-danger input-group my-4 text-center" onclick="reject_notery('${notary._id}')" style="width:15rem;">
                    <span class="mx-auto">Reject</span>
                </button>
            </td>
            
            </tr>`;
      tableBody.append(tablerow);
    });
    reqData.currentPageNumber = pageNumber
    /* Display buttons */
    getPageButtons(pageCount);
  }
}


function getPageButtons(pageCount, tableName) {
  $(".page-buttons").empty();

  /* Declaring next and previous page buttons */
  let previous_page_button = `
        <button class='btn btn-sm btn-primary' disabled>  
          <<
        </button>`;
  $(".page-buttons").append(previous_page_button);

  let next_page_button = `
        <button class='btn btn-sm btn-primary '>  
          >>
        </button>`;

  /* rendering buttons according to page count */
  for (let index = 1; index <= pageCount; index++) {
    let pageNumberButtons = ` 
        <button class="btn btn-sm btn-primary page-button-number ">
          ${index}
        </button>`;
    /* Appending buttons to table */
    $(".page-buttons").append(pageNumberButtons);
  }
  /* appending next page butoon at the last
   */
  $(".page-buttons").append(next_page_button);

  /* Enabling and disabling previous and next page buttons */
  if (reqData.currentPageNumber > 0) {
    $(".previous-page-btn").attr("disabled", false);
  }
  if (reqData.currentPageNumber === 0) {
    $(".next-page-btn").attr("disabled", false);
  }
  if (reqData.currentPageNumber == pageCount - 1) {
    $(".next-page-btn").attr("disabled", true);
  }

  $(".page-button-number").on("click", (e) => {
    $(this).addClass("active");
    $("tbody").empty();
    /* showMiniLoader(); */
    console.log(e)
    let clickedpageButton = e.target.innerText;
    console.log('clickedpageButton--', clickedpageButton)
    reqData.currentPageNumber = parseInt(clickedpageButton, 10) - 1;
    notery_list(reqData);
    $(`[value = ${reqData.currentPageNumber}]`).addClass("active");
  });



  $(".next-page-btn").on("click", () => {
    $("tbody").empty();
    /* showMiniLoader(); */
    if (reqData.currentPageNumber != 1) {
      $(".previous-page-btn").attr("disabled", false);
    }
    let nextPageNumber = reqData.currentPageNumber + 1;
    reqData.currentPageNumber = nextPageNumber;
    notery_list(reqData);
  });


  $(".previous-page-btn").on("click", () => {
    $("tbody").empty();
    /*     showMiniLoader(); */
    if (reqData.currentPageNumber == 1) {
      $(".previous-page-btn").attr("disabled", true);
    }
    let previousPageNumber = reqData.currentPageNumber - 1;
    reqData.currentPageNumber = previousPageNumber;
  });
}


var admin_id = localStorage.getItem("adminId")

function approve_notery(notery_id) {
  console.log("function notery_id--", notery_id)
  var btn_id = document.getElementById(`app_${notery_id}`)
  console.log("btn-id--",btn_id)
  btn_id.innerHTML = `<span class="mini-loader"></span><span class="mx-auto">Approve</span>`
  console.log("btn-id--",btn_id)
  showMiniLoader()
  fetch(`https://api.notarizetech.com/admin/notary/approveNotary`, {
      method: "POST",
      body: JSON.stringify({
        "notaryId": notery_id,
        "adminId": admin_id
      }),

      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": "Bearer " + localStorage.getItem("token")

      },
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      if (!response.status) {
        swal({
          text: `${response.message}`,
          type: "error",
          icon: "error"
        })
      }
      console.log(response);
      swal({
        title: "Nice",
        text: "NotaryApproved Successfully",
        type: "success",
        icon: "success"
      }).then(function () {
        window.location.href = "notery_pending.html"

      });

      /* function to render table */
    })
    .catch((err) => {
      swal({
        title: "Oops",
        text: `Error in fetching Data Refresh Page`,
        type: "error",
        icon: "error"
      }).then(()=>window.location.reload())
    })

}


function reject_notery(notery_id) {
  var btn_id = document.getElementById(`rej_${notery_id}`)
  console.log("btn-id--",btn_id)
  btn_id.innerHTML = `<span class="mini-loader mx-3"></span><span class="mx-auto">Reject</span>`
  console.log("btn-id--",btn_id)
  showMiniLoader()
  fetch(`https://api.notarizetech.com/admin/notary/revokeNotary`, {
      method: "POST",
      body: JSON.stringify({
        "notaryId": notery_id,
        "adminId": admin_id
      }),

      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": "Bearer " + localStorage.getItem("token")

      },
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      if (!response.status) {
        swal({
          text: `${response.message}`,
          type: "error",
          icon: "error"
        })
      }
      console.log(response);
      swal({
        text: "NotaryApproval Rejected",
        type: "warning",
        icon: "warning"
      }).then(function () {
        window.location.href = "notery_pending.html"

      });

    })
    .catch((err) => {
      swal({
        title: "Oops",
        text: `Error in fetching Data Refresh Page`,
        type: "error",
        icon: "error"
      }).then(()=>window.location.reload())
    })
}
