let reqData = {
  currentPageNumber: 0,
};

var reqUserData = {};

if (localStorage.getItem("isMasterAdmin") == "true") {
  function schedualing_team() {
    fetch(`https://sideshnew-zenwin.herokuapp.com/admin/getSubAdmins`, {
      method: "GET",
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

  schedualing_team();

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
      console.log(e);
      let clickedpageButton = e.target.innerText;
      console.log("clickedpageButton--", clickedpageButton);
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

  function create_sub_admin() {
    showLoader();
    // let second_firebase = firebase.initializeApp(firebaseConfig,"Secondary");
    let SignInEmail = $("#sign-up-email").val();
    let SignInPassword = $("#sign-up-password").val();
    let Mobile = $("#sign-up-mobile").val();
    console.log(
      "email--",
      SignInEmail,
      "  pass--",
      SignInPassword,
      " mobile--",
      Mobile
    );
    if (SignInEmail == "" || SignInPassword == "" || Mobile == "") {
      $(".sign-in-error").html("Please Fill All the Fields! ").fadeOut(3000);
    } else {
      reqUserData = {
        email: SignInEmail,
        password: SignInPassword,
        mobile: Mobile,
      };
      sendUserDetails(reqUserData, "subAdmin");
    }
  }

  function create_master_admin() {
    showLoader();
    // let second_firebase = firebase.initializeApp(firebaseConfig,"Secondary");
    let SignInEmail = $("#sign-up-emailM").val();
    let SignInPassword = $("#sign-up-passwordM").val();
    let Mobile = $("#sign-up-mobileM").val();
    console.log(
      "email--",
      SignInEmail,
      "  pass--",
      SignInPassword,
      " mobile--",
      Mobile
    );
    if (SignInEmail == "" || SignInPassword == "" || Mobile == "") {
      $(".sign-in-error").html("Please Fill All the Fields! ").fadeOut(3000);
    } else {
      reqUserData = {
        email: SignInEmail,
        password: SignInPassword,
        mobile: Mobile,
      };
      sendUserDetailsM(reqUserData, "masterAdmin");
    }
  }
}

function sendUserDetailsM(reqUserData, type) {
  fetch(
    `https://sideshnew-zenwin.herokuapp.com/admin/createSubAdmins?admin=true`,
    {
      method: "POST",
      body: JSON.stringify(reqUserData),
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      if (!response.status) {
        swal({
          title: "Oops",
          text: `${response.message}`,
          type: "error",
          icon: "error",
        }).then(function () {
          hideLoader();
        });
      }
      console.log(response);
      let text = "Admin Created Successfully";
      if (type == "subAdmin") {
        text = "SubAdmin Created Successfully";
      }
      /* function to render table */
      swal({
        title: "Nice",
        text,
        type: "success",
        icon: "success",
      }).then(function () {
        schedualing_team();
      });
    })
    .catch((err) => {
      swal({
        title: "Oops",
        text: `Error in fetching Data ${err}`,
        type: "error",
        icon: "error",
      }).then(function () {
        hideLoader();
      });
      // console.log(`error ${err}`);
    });
}

function sendUserDetails(reqUserData, type) {
  fetch(
    `https://sideshnew-zenwin.herokuapp.com/admin/createSubAdmins?subAdmin=true`,
    {
      method: "POST",
      body: JSON.stringify(reqUserData),
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      if (!response.status) {
        swal({
          title: "Oops",
          text: `${response.message}`,
          type: "error",
          icon: "error",
        }).then(function () {
          hideLoader();
        });
      }
      console.log(response);
      let text = "Admin Created Successfully";
      if (type == "subAdmin") {
        text = "SubAdmin Created Successfully";
      }
      /* function to render table */
      swal({
        title: "Nice",
        text,
        type: "success",
        icon: "success",
      }).then(function () {
        schedualing_team();
      });
    })
    .catch((err) => {
      swal({
        title: "Oops",
        text: `Error in fetching Data ${err}`,
        type: "error",
        icon: "error",
      }).then(function () {
        hideLoader();
      });
      // console.log(`error ${err}`);
    });
}

function delete_subadmin(email) {
  console.log(localStorage.getItem("token"));
  console.log(email);
  fetch(
    "https://obscure-beyond-63635.herokuapp.com/https://sideshnew-zenwin.herokuapp.com/admin/deleteSubAdmin?email=" +
      email,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  )
    .then((response) => {
      console.log(response);
      if (response.status !== 200) {
        throw new Error("Please try again later");
      }
      location.reload();
    })
    .catch((err) => {
      swal({
        title: "Oops",
        text: `${err}`,
        type: "error",
        icon: "error",
      });
    });
}

//   function delete_subadmin(subAdminID, email) {
//     console.log("subAdminID--", subAdminID)
//     swal({
//         title: "Are you sure?",
//         text: `You want to Delete Subadmin ${email} `,
//         icon: "warning",
//         type: "warning",
//         buttons: true,
//         dangerMode: true,
//       })
//       .then((willDelete) => {
//         if (willDelete) {
//           showLoader()
//           fetch(`https://api.notarizetech.com/admin/master/deleteSubAdmin`, {
//               method: "POST",
//               body: JSON.stringify({
//                 subAdminIdToDelete: subAdminID,
//                 confirmDelete7392:true,
//                 masterAdminId: localStorage.getItem("adminId")
//               }),
//               headers: {
//                 "Content-Type": "application/json;charset=UTF-8",
//                 "Authorization": "Bearer " + localStorage.getItem("token")

//               },
//             })
//             .then((response) => {
//               return response.json();
//             })
//             .then((response) => {
//               if (!response.status) {
//                 swal({
//                   title: "Oops",
//                   text: `${response.message}`,
//                   type: "error",
//                   icon: "error"
//                 });
//                 hideLoader()
//               }
//               console.log(response);
//               swal({
//                 title: "",
//                 text: `You Have deleted subAdmin ${email}`,
//                 type: "success",
//                 icon: "success"
//               }).then(function () {
//                 schedualing_team()
//               })
//             })
//             .catch((err) => {
//               swal({
//                 title: "Oops",
//                 text: `Error in fetching Data ${err}`,
//                 type: "error",
//                 icon: "error"
//               });
//               hideLoader()
//               // console.log(`error ${err}`);
//             });

//         }
//       });

//   }
// } else {
//   swal({
//     title: "Oops!",
//     text: `You are not Authenticated for this page`,
//     type: "error",
//     icon: "error"
//   }).then(function () {
//     window.location.href = "index.html"
//   })
// }
