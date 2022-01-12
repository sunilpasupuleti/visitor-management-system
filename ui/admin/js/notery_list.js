/* Current page number which has to be sent to server */
let reqData = {
  currentPageNumber: 0,
};



function notery_list() {
  /* Using Temporary api call , replacw with proper api call */
  fetch(`https://api.notarizetech.com/admin/notary/getApprovedNotaries`, {
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
          title: "Oops",
          text: `${response.message}`,
          type: "error",
          icon: "error"
        });
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
    notaries,
    payoutStatus
  } = tableData;
  if (notaries.length == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No Any Data Available</h2>'
    );
  } else {
    var count = 0
    notaries.forEach((notary) => {

      let tablerow = ""
      tablerow += `<tr>
      <td><a onclick="toggle_favorite_notery('${notary._id}')" style="cursor:pointer; color:#0341fc;"><i id="${notary._id}"  class="fas fa-heart fa-2x"`
      if (!notary.isFavorite) {
        tablerow += `style=""`
      } else {
        tablerow += `style="color:red;"`
      }
      tablerow += `></i></a></td>
      <td><img src="${notary.userImageURL}" class="avatar rounded-circle" style="width:2rem; height:2rem;"><span class="form-control-label ml-2">${notary.firstName} ${notary.lastName}</span></td>
      <td>${notary.orderDeliveredCount}</td>
      <td>$${payoutStatus[count].paid}</td>
      <td>$${payoutStatus[count].due}</td>
      <th><a style="cursor:pointer; color:#0341fc;" href="view_notery_details.html?notaryId=${notary._id}">View Details</a></th>
      </tr>`;
      count++;
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

function toggle_favorite_notery(notery_id) {
  var notary_isfavorite = false
  fetch(`https://api.notarizetech.com/admin/notary/getNotaryProfile`, {
      method: "POST",
      body: JSON.stringify({
        notaryId: notery_id,
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
          title: "Oops",
          text: `${response.message}`,
          type: "error",
          icon: "error"
        });
      }
      console.log(response);
      notary_isfavorite = response.notary.isFavorite
      if (notary_isfavorite == undefined) {
        notary_isfavorite = false
      }
      var toggle_heart = document.getElementById(notery_id)
      if (!notary_isfavorite) {
        console.log(toggle_heart)
        toggle_heart.style = "color:red;"
        notary_isfavorite = true;
      } else {
        console.log(toggle_heart)
        toggle_heart.style = "color:;"
        notary_isfavorite = false;
      }
      fetch(`https://api.notarizetech.com/admin/notary/toggleNotaryAsFavorite`, {
          method: "POST",
          body: JSON.stringify({
            notaryId: notery_id,
            adminId: localStorage.getItem("adminId"),
            isFavorite: notary_isfavorite
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
              title: "Oops",
              text: `${response.message}`,
              type: "error",
              icon: "error"
            });
          }
          console.log(response);
          // window.location.href = "favorite_notary.html"
        })
        .catch((err) => {
          swal({
            title: "Oops",
            text: `Error in fetching Data ${err}`,
            type: "error",
            icon: "error"
          });
          // console.log(`error ${err}`);
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


function filterOrders() {
  showLoader();

  filterValues = {
    pageNumber: reqData.pageNumber,
    adminId: localStorage.getItem("adminId"),
    notaryName: $("#input-notary-name").val(),
    notaryEmail: $("#input-notary-name").val(),
  };

  console.log(filterValues);
  fetch("https://api.notarizetech.com/admin/notary/filterNotaries", {
      method: "POST",
      body: JSON.stringify(filterValues),
      headers: {
        "Content-type": "application/json;charset=UTF-8",
        "Authorization": "Bearer " + localStorage.getItem("token")

      },
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      buildnoteryTable(data)
      hideLoader();
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