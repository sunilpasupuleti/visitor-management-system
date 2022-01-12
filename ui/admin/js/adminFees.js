let reqData = {
  pageNumber: 0,
};

var reqUserData = {};

if (localStorage.getItem("isMasterAdmin") == "true") {
  function schedualing_team() {
    fetch(`https://sideshnew-zenwin.herokuapp.com/admin/getAdminFees`, {
      method: "POST",
      body: JSON.stringify(reqData),
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        // if (!response.status) {
        //   swal({
        //     title: "Oops",
        //     text: `${response.message}`,
        //     type: "error",
        //     icon: "error"
        //   });
        // }
        console.log(response);
        /* function to render table */
        buildSchedualingTeamTable(response);
        hideLoader();
      })
      .catch((err) => {
        swal({
          title: "Oops",
          text: `Error in fetching Data Refresh Page`,
          type: "error",
          icon: "error",
        }).then(() => window.location.reload());
      });
  }
}

function buildSchedualingTeamTable(tableData) {
  console.log(tableData);
  let tableBody = $(".Schedualing-Team");
  tableBody.empty();
  const { pageCount, subAdminCount, pageNumber, subAdmins } = tableData;
  if (subAdminCount == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">Create Sub-Admin</h2>'
    );
  } else {
    tableData.forEach((subAdmin) => {
      let tablerow = `
        <tr>
          <td>${subAdmin.email}</td>
          <td><b>${subAdmin.mobile}</b></td>
          <td><button class="btn btn-danger" onclick="delete_subadmin('${subAdmin.email}')">Delete</button></td>
        </tr>
        `;
      tableBody.append(tablerow);
    });
    reqData.currentPageNumber = pageNumber;
    /* Display buttons */
    // getPageButtons(pageCount);
  }
}

// function getPageButtons(pageCount, tableName) {
//   $(".page-buttons").empty();

//   /* Declaring next and previous page buttons */
//   let previous_page_button = `
//     <button class='btn btn-sm btn-primary' disabled>
//       <<
//     </button>`;
//   $(".page-buttons").append(previous_page_button);

//   let next_page_button = `
//     <button class='btn btn-sm btn-primary '>
//       >>
//     </button>`;

//   /* rendering buttons according to page count */
//   for (let index = 1; index <= pageCount; index++) {
//     let pageNumberButtons = `
//     <button class="btn btn-sm btn-primary page-button-number ">
//       ${index}
//     </button>`;
//     /* Appending buttons to table */
//     $(".page-buttons").append(pageNumberButtons);
//   }
//   /* appending next page butoon at the last
//    */
//   $(".page-buttons").append(next_page_button);

//   /* Enabling and disabling previous and next page buttons */
//   if (reqData.currentPageNumber > 0) {
//     $(".previous-page-btn").attr("disabled", false);
//   }
//   if (reqData.currentPageNumber === 0) {
//     $(".next-page-btn").attr("disabled", false);
//   }
//   if (reqData.currentPageNumber == pageCount - 1) {
//     $(".next-page-btn").attr("disabled", true);
//   }

//   $(".page-button-number").on("click", (e) => {
//     $(this).addClass("active");
//     $("tbody").empty();
//     /* showMiniLoader(); */
//     console.log(e)
//     let clickedpageButton = e.target.innerText;
//     console.log('clickedpageButton--', clickedpageButton)
//     reqData.currentPageNumber = parseInt(clickedpageButton, 10) - 1;
//     schedualing_team(reqData);
//     $(`[value = ${reqData.currentPageNumber}]`).addClass("active");
//   });

//   $(".next-page-btn").on("click", () => {
//     $("tbody").empty();
//     /* showMiniLoader(); */
//     if (reqData.currentPageNumber != 1) {
//       $(".previous-page-btn").attr("disabled", false);
//     }
//     let nextPageNumber = reqData.currentPageNumber + 1;
//     reqData.currentPageNumber = nextPageNumber;
//     schedualing_team(reqData);
//   });

//   $(".previous-page-btn").on("click", () => {
//     $("tbody").empty();
//     /*     showMiniLoader(); */
//     if (reqData.currentPageNumber == 1) {
//       $(".previous-page-btn").attr("disabled", true);
//     }
//     let previousPageNumber = reqData.currentPageNumber - 1;
//     reqData.currentPageNumber = previousPageNumber;
//   });
// }
