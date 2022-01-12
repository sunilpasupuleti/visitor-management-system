let reqData = {
  currentPageNumber: 0,
};

// if (localStorage.getItem("isMasterAdmin") == "true") {
let s = 0;
let s1 = 0;
let s2 = 0;
function showTransactions(typeOfTransaction, i) {
  profile.innerHTML = `<div class="col" id="order-completed-table">
        <div class="card table-flush">
          <div class="table-responsive">
            <table class="table align-items-center" id="invoice_table">
              <thead class="thead">
                <tr>
                <th><b class="text-dark">Id</b></th>
                <th><b class="text-dark">User Id</b></th>
                <th><b class="text-dark">Level</b></th>
                <th><b class="text-dark">Period Id</b></th>
                <th><b class="text-dark">Amount</b></th>
                <th><b class="text-dark">Amount Fees</b></th>
                <th><b class="text-dark">Created At</b></th>
                </tr>
              </thead>
              <tbody class="list invoices-list"></tbody>
            </table>
          </div>
          <div class="card-footer py-4">
          <button class="btn btn-sm btn-primary" onclick="showTransactions('pending',-10)" style="float:center;margin-left: 45%; ">prev</button>
          <button class="btn btn-sm btn-primary" onclick="showTransactions('pending',0)" style="float:center; ">1</button>
          
          <button class="btn btn-sm btn-primary" onclick="showTransactions('pending',10)" style="float:center;">next</button>
          </div>
        </div>`;
  if (i == undefined) {
    i = 0;
  }
  s = s + i;
  console.log("hi", s);
  if (i == 0) {
    s = 0;
  } else if (s < 0) {
    s = 0;
  }
  fetch(
    `https://sideshnew-zenwin.herokuapp.com/admin/payment/getAdminFees?limit=30&skip=` +
      s,
    {
      method: "GET",
      // body: JSON.stringify({
      //   pageNumber: reqData.currentPageNumber,
      //   masterAdminId: localStorage.getItem("adminId")
      // }),
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  )
    .then((response) => {
      const res = response.json();
      const status = response.status;
      return {
        res,
        status,
      };
    })
    .then((response) => {
      if (response.status != 200) {
        //we can do !response.status because if status comes other than 200 then catch block will catch it
        swal({
          title: "Oops!",
          text: `${response.res}`,
          type: "error",
          icon: "error",
        });
      }
      return response.res;
    })
    .then((response) => {
      console.log(response);
      /* function to render table */
      buildInvoiceTable(response);
      hideLoader();
    })
    .catch((err) => {
      swal({
        title: "Oops!",
        text: `${err}`,
        type: "error",
        icon: "error",
      });
    });
}

showTransactions("pending");

function buildInvoiceTable(tableData) {
  console.log(tableData);
  let tableBody = $(".invoices-list");
  tableBody.empty();
  const { pageCount, invoiceCount, pageNumber, invoices } = tableData;
  if (tableData.length == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No more invited earnings</h2>'
    );
  } else {
    tableData.forEach((invoice) => {
      let createdDate = new Date(invoice.createdAt);
      var formattedDate = moment(createdDate).format(
        "MMM-DD-YYYY    hh:mm:ss A"
      );
      let tablerow = "";
      tablerow += `<tr>
      <th>${invoice.Id}</th>
      <td><a style="cursor:pointer; color:#0341fc;" href="client_profile.html?customerId=${invoice.userId}">${invoice.userId}</td>
          <td>${invoice.level}</td>
          <td>₹${invoice.periodId}</td>
          <td>${invoice.amount}</td>
          <td>${invoice.amountCharged}</td>
          <td>${formattedDate}</td>
         
          </tr>`;
      tableBody.append(tablerow);
    });
    reqData.currentPageNumber = pageNumber;
    /* Display buttons */
    // getPageButtons(pageCount);
  }
}

//   function getPageButtons(pageCount, tableName) {
//     $(".page-buttons").empty();

//     /* Declaring next and previous page buttons */
//     let previous_page_button = `
//         <button class='btn btn-sm btn-primary' disabled>
//           <<
//         </button>`;
//     $(".page-buttons").append(previous_page_button);

//     let next_page_button = `
//         <button class='btn btn-sm btn-primary '>
//           >>
//         </button>`;

//     /* rendering buttons according to page count */
//     for (let index = 1; index <= pageCount; index++) {
//       let pageNumberButtons = `
//         <button class="btn btn-sm btn-primary page-button-number ">
//           ${index}
//         </button>`;
//       /* Appending buttons to table */
//       $(".page-buttons").append(pageNumberButtons);
//     }
//     /* appending next page butoon at the last
//      */
//     $(".page-buttons").append(next_page_button);

//     /* Enabling and disabling previous and next page buttons */
//     if (reqData.currentPageNumber > 0) {
//       $(".previous-page-btn").attr("disabled", false);
//     }
//     if (reqData.currentPageNumber === 0) {
//       $(".next-page-btn").attr("disabled", false);
//     }
//     if (reqData.currentPageNumber == pageCount - 1) {
//       $(".next-page-btn").attr("disabled", true);
//     }

//     $(".page-button-number").on("click", (e) => {
//       $(this).addClass("active");
//       $("tbody").empty();
//       /* showMiniLoader(); */
//       console.log(e)
//       let clickedpageButton = e.target.innerText;
//       console.log('clickedpageButton--', clickedpageButton)
//       reqData.currentPageNumber = parseInt(clickedpageButton, 10) - 1;
//       showTransactions(reqData);
//       $(`[value = ${reqData.currentPageNumber}]`).addClass("active");
//     });

//     $(".next-page-btn").on("click", () => {
//       $("tbody").empty();
//       /* showMiniLoader(); */
//       if (reqData.currentPageNumber != 1) {
//         $(".previous-page-btn").attr("disabled", false);
//       }
//       let nextPageNumber = reqData.currentPageNumber + 1;
//       reqData.currentPageNumber = nextPageNumber;
//       showTransactions(reqData);
//     });

//     $(".previous-page-btn").on("click", () => {
//       $("tbody").empty();
//       /*     showMiniLoader(); */
//       if (reqData.currentPageNumber == 1) {
//         $(".previous-page-btn").attr("disabled", true);
//       }
//       let previousPageNumber = reqData.currentPageNumber - 1;
//       reqData.currentPageNumber = previousPageNumber;
//     });
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

function abc(url) {
  console.log(url);
  img01.src = url;
  myModal.style.display = "block";
}
function closeSS() {
  console.log("hello");
  myModal.style.display = "none";
}

function approve(id) {
  const obj = {
    transactionId: id,
    status: "approved",
  };
  console.log(JSON.stringify(obj));
  console.log("Entererd");
  console.log(id);
  fetch(`https://sideshnew-zenwin.herokuapp.com/admin/payment/withdrawal`, {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => {
      const res = response.json();
      const status = response.status;
      return { res, status };
    })
    .then((response) => {
      if (response.status != 200) {
        throw new error("Can't");
      }
      return response.res;
    })
    .then((response) => {
      console.log("the status", response);
      var approveButton = document.getElementById(id);
      var rejectButton = document.getElementById(id + "1");
      console.log("lal");
      rejectButton.disabled = "true";
      approveButton.className = "btn btn-success";
      approveButton.disabled = "true";
      approveButton.innerHTML = "Approved";
    })
    .catch((err) => {
      console.log(err);
    });
}

///sending id+'1' for discrete id of every button
function reject(transactionId, rejectId, reasonId) {
  var reason = document.getElementById(reasonId).value;
  console.log(reason);
  console.log(transactionId);
  const obj = {
    transactionId,
    status: "rejected",
    rejectedReason: reason,
  };
  console.log(JSON.stringify(obj));
  console.log("Entererd");
  console.log(rejectId);
  fetch(`https://sideshnew-zenwin.herokuapp.com/admin/payment/withdrawal`, {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => {
      const res = response.json();
      const status = response.status;
      return { res, status };
    })
    .then((response) => {
      if (response.status != 200) {
        throw new error("Can't");
      }
      return response.res;
    })
    .then((response) => {
      console.log("the status", response);
      var rejectButton = document.getElementById(rejectId);
      var approveButton = document.getElementById(transactionId);
      console.log("lal");
      approveButton.disabled = "true";
      console.log("Just Before Property", rejectId);
      rejectButton.className = "btn btn-warning";
      rejectButton.disabled = "true";
      rejectButton.innerHTML = "Rejected";
    })
    .catch((err) => {
      console.log(err);
    });
}

function view_invoice(InvoiceID) {
  showLoader();
  let myRedirector = document.createElement("a");
  myRedirector.setAttribute("target", "_blank");
  fetch("https://api.notarizetech.com/customer/getInvoicePDF", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      adminId: localStorage.getItem("adminId"),
      invoiceId: InvoiceID,
    }),
  })
    .then((res) => res.blob())
    .then((data) => {
      console.log(data);
      // create an object URL from the Blob
      var URL = window.URL || window.webkitURL;
      var downloadUrl = URL.createObjectURL(data);
      console.log(downloadUrl);
      hideLoader();
      myRedirector.href = downloadUrl;
      myRedirector.click();
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
