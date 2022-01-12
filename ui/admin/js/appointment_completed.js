var appointmentType = "getAssignedOrders";
/* Current page number which has to be sent to server */
let reqData = {
  currentPageNumber: 0,
};



function appointments_completed() {
  /* Using Temporary api call , replacw with proper api call */
  fetch(`https://api.notarizetech.com/admin/order/getCompletedOrders`, {
      method: "POST",
      body: JSON.stringify({
        pageNumber: reqData.currentPageNumber
      }),
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": "Bearer " + localStorage.getItem("token"),

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
      var orders_count = document.getElementById("orders_count")
      orders_count.innerText = response.orderCount
      buildAppointmentcompletedTable(response);
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

appointments_completed();

function buildAppointmentcompletedTable(tableData) {
  console.log(tableData)
  let tableBody = $(".appointment-completed");
  tableBody.empty();
  const {
    pageCount,
    orderCount,
    pageNumber,
    orders
  } = tableData;
  if (orders.length == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No orders Ongoing</h2>'
    );
  } else {
    orders.forEach((order) => {
      const {
        amount,
        appointment,
        customer
      } = order;
      let tablerow = `
        <tr>
        <th><a style="cursor:pointer; color:#0341fc;" href="order_details.html?orderId=${order._id}&ecscrow=${order.appointment.escrowNumber}">${order.appointment.escrowNumber}</a></th>
            <td>${order.customer.companyName}</td>
            <td>$${order.amount}</td>
            <td>${getDate(order.assignedAt)}</td>
            <td>
              <img src="${order.assignedToNotary.userImageURL}" class="avatar rounded-circle" style="width:2rem; height:2rem;">
              <b>${order.assignedToNotary.firstName} ${order.assignedToNotary.lastName}</b><br>
              <span>Accepted At :${getDate(order.notaryArrivedAt)}</span><br>
              <span>Delivered At :${getDate(order.deliveredAt)}</span>
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
    appointments_completed(reqData);
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
    appointments_completed(reqData);
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


function filterOrders() {
  showLoader();
  let orderInvoicetype = [];
  [
    ...document.querySelectorAll('input[name="input-ordertype-check"]:checked'),
  ].forEach((order) => orderInvoicetype.push(order.value));

  filterValues = {
    pageNumber: reqData.pageNumber,
    startDate: $("#input-appointment-start-date").val(),
    endDate: $("#input-appointment-end-date").val(),
    adminId: localStorage.getItem("adminId"),
    orderInvoiceType: orderInvoicetype,
    notaryName: $("#input-notary-name").val(),
    notaryEmail: $("#input-notary-name").val(),
    customerCompanyName: $("#input-notary-name").val(),
    customerName: $("#input-notary-name").val(),
    customerEmail: $("#input-notary-name").val(),
    orderStatusStart: 5,
    orderStatusEnd: 9
  };
  console.log(filterValues);
  fetch("https://api.notarizetech.com/admin/order/filterOrders", {
      method: "POST",
      body: JSON.stringify(filterValues),
      headers: {
        "Content-type": "application/json;charset=UTF-8",
        "Authorization": "Bearer " + localStorage.getItem("token"),

      },
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
      var orders_count = document.getElementById("orders_count")
      orders_count.innerText = response.orderCount
      buildAppointmentcompletedTable(response)
      hideLoader();
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