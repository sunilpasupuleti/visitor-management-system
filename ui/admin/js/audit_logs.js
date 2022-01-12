let reqData = {
  currentPageNumber: 0,
};
// console.log(localStorage.getItem("isMasterAdmin"))
if (localStorage.getItem("isMasterAdmin") == "true") {
  function schedualing_team() {
    fetch(`https://api.notarizetech.com/admin/master/getAllActivities`, {
        method: "POST",
        body: JSON.stringify({
          pageNumber: reqData.currentPageNumber,
          masterAdminId: localStorage.getItem("adminId")
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
            title: "Oops!",
            text: `${response.message}`,
            type: "error",
            icon: "error"
          })
        }
        console.log(response);
        /* function to render table */
        buildSchedualingTeamTable(response);
        hideLoader()
      })
      .catch((err) => {
        swal({
          title: "Oops!",
          text: `${err}`,
          type: "error",
          icon: "error"
        })
      });

  }


  schedualing_team()

  function buildSchedualingTeamTable(tableData) {
    console.log(tableData)
    let tableBody = $(".Schedualing-Team");
    tableBody.empty();
    const {
      pageCount,
      activityCount,
      pageNumber,
      activities
    } = tableData;
    if (activities.length == 0) {
      tableBody.html(
        '<h2 class="d-flex justify-content-center mt-3">No orders Ongoing</h2>'
      );
    } else {
      activities.forEach((activity) => {
        let tablerow = `
      <tr>
        <td>${getDate(activity.timestamp)}</td>
        <td><img src="${activity.user.userImageURL}" class="avatar rounded-circle" style="width:2rem; height:2rem;"> ${activity.user.firstName} ${activity.user.lastName}</td>
        <td>${activity.description}</td>
      </tr>
      `;
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
      schedualing_team(reqData);
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
      schedualing_team(reqData);
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
} else {
  swal({
    title: "Oops!",
    text: `You are not Authenticated for this page`,
    type: "error",
    icon: "error"
  }).then(function () {
    window.location.href = "index.html"
  })
}