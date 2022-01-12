var appointmentType = "getAssignedOrders";
/* Current page number which has to be sent to server */
let reqData = {
  currentPageNumber: 0,
};

let game_id;
let period_id;
let end_time;

let s = 0;
async function fetchGameData(i) {
  s = s + i;
  if (i == 0) {
    s = 0;
  } else if (s < 0) {
    s = 0;
  }
  const api_url =
    "https://sideshnew-zenwin.herokuapp.com/admin/gameView?gameType=ab&skip=" +
    s +
    "&limit=10";
  console.log(s);
  let response = await fetch(api_url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  console.log(response.status); // 200
  console.log(response.statusText); // OK

  if (response.status === 200) {
    let data = await response.json();
    console.log("data", data);
    end_time = new Date(data.runningGameDetails.endTime);
    period_id = data.runningGame.periodId;

    setCountdown();

    const runningGame = {
      numberOfBets: data.runningGame.numberOfBets,
      totalAmountCollected: data.runningGame.totalAmountCollected,
      amountDistributed: data.runningGame.amountDistributed,
      finished: data.runningGame.finished,
      gameId: data.runningGame.gameId,
      periodId: data.runningGame.periodId,
    };

    game_id = runningGame.gameId;
    console.log("game_id", game_id);
    buildAppointmentTable(data, runningGame);
    hideLoader();
  }
}

function setCountdown() {
  var countDownDate = end_time.getTime();

  var x = setInterval(() => {
    var now = new Date().getTime();

    var distance = countDownDate - now;

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("period_id").innerText = "ID : " + period_id;

    document.getElementById("timer").innerHTML =
      "<h2>" +
      // days +
      // "d " +
      // hours +
      // "h " +
      minutes +
      "m " +
      seconds +
      "s </h2>";
    if (distance < 0) {
      clearInterval(x);
      document.getElementById("timer").innerHTML = "<h2>GAME COMPLETED</h2>";
      // location.reload();
    }
  }, 1000);
}

fetchGameData(0).then(() => {
  game_data();
});

// game_data();
let t = 36;
let count = 0;
function game_data() {
  fetch(
    `https://sideshnew-zenwin.herokuapp.com/admin/getGameBetsDetails?gameId=` +
      game_id,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  )
    .then((response) => {
      return response;
    })
    .then((response) => {
      if (response.status != 200) {
        swal({
          title: "Oops!",
          text: `${response.message}`,
          type: "error",
          icon: "error",
        });
      }
      return response.json();
    })
    .then((response) => {
      console.log("game_data ", response);
      /* function to render table */
      // var orders_count = document.getElementById("orders_count")
      // orders_count.innerText = response.orderCount
      buildGameDataTable(response);
      hideLoader();
    })
    .catch((err) => {
      console.log(err);
      //   swal({
      //     title: "Oops",
      //     text: `Error in fetching Data Refresh Page `,
      //     type: "error",
      //     icon: "error",
      //   }).then(() => window.location.reload());
    });
  // t=t-1;
  count++;
  console.log(count);
  if (t > 0) {
    setTimeout(() => {
      game_data();
    }, 5000);
  }
}

function change_res(id) {
  console.log(id);
  let len = id.length;
  console.log("THHHH", id.substr(0, 1));
  console.log("THHHH1", id.substr(1, len));
  const obj = {
    number: id.substr(0, 1),
    color: id.substr(1, len),
    gameId: game_id,
  };
  console.log(obj);
  fetch(
    "https://obscure-beyond-63635.herokuapp.com/https://sideshnew-zenwin.herokuapp.com/admin/setGameResult",
    {
      method: "PATCH",
      body: JSON.stringify({
        number: id.substr(0, 1),
        color: id.substr(1, len),
        gameId: game_id,
      }),
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  )
    .then((response) => {
      console.log(response);
      return response.text();
    })
    .then((response) => {
      swal({
        title: "Nice",
        text: response,
        type: "success",
        icon: "success",
      }).then(() => {
        window.location.reload();
      });
      console.log("hey", response);
    })
    .catch((err) => {
      console.log(err);
    });
}

function delete_game() {
  fetch(
    "https://obscure-beyond-63635.herokuapp.com/https://sideshnew-zenwin.herokuapp.com/admin/deleteUnfinishedGames",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  );
}

function appointments_scheduled() {
  /* Using Temporary api call , replacw with proper api call */
  fetch(`https://api.notarizetech.com/admin/order/getAssignedOrders`, {
    method: "POST",
    body: JSON.stringify({
      pageNumber: reqData.currentPageNumber,
    }),
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: "Bearer " + localStorage.getItem("token"),
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
          icon: "error",
        });
      }
      console.log(response);
      /* function to render table */
      var orders_count = document.getElementById("orders_count");
      orders_count.innerText = response.orderCount;
      buildAppointmentscheduledTable(response);
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

// appointments_scheduled();

function buildGameDataTable(tableData) {
  console.log("here", tableData);
  // console.log(tableData.runningGame.gameId);
  // console.log(tableData.runningGame.numberOfBets);
  // console.log(tableData.runningGame.totalAmountCollected);
  // console.log(tableData.runningGame.amountDistributed);
  // console.log(tableData.runningGame.finished);
  // console.log();
  // tableData.finishedGames.push(runningGame);
  // tableData.finishedGames=[runningGame].concat(tableData.finishedGames);
  // console.log(runningGame);
  let tableBody = $(".game-details");
  const gameIds = tableData.betAmount.length;
  // console.log(gameIds);
  tableBody.empty();
  const { pageCount, orderCount, pageNumber, orders } = tableData;
  const allGames = tableData.betAmount;
  const allGamesW = tableData.winningAmount;
  const colors = tableData.color;

  if (gameIds == 0) {
    console.log("null");
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No orders Ongoing</h2>'
    );
  } else {
    // for bet details

    let andhar = document.getElementById("andhar");
    let bahar = document.getElementById("bahar");
    let tie = document.getElementById("tie");
    let total = document.getElementById("total");

    andhar.innerHTML = colors.green || 0;
    bahar.innerHTML = colors.violet || 0;
    tie.innerHTML = colors.red || 0;

    total.innerHTML =
      allGames[1].value +
      allGames[0].value +
      allGames[2].value +
      allGames[3].value +
      allGames[4].value +
      allGames[5].value +
      allGames[6].value +
      allGames[7].value +
      allGames[8].value +
      allGames[9].value;

    //for winning

    let andharW = document.getElementById("andharW");
    let baharW = document.getElementById("baharW");
    let tieW = document.getElementById("tieW");
    let totalW = document.getElementById("totalW");

    andharW.innerHTML = colors.green || 0;
    baharW.innerHTML = colors.violet || 0;
    tieW.innerHTML = colors.red || 0;

    totalW.innerHTML =
      allGamesW[1].value +
      allGamesW[0].value +
      allGamesW[2].value +
      allGamesW[3].value +
      allGamesW[4].value +
      allGamesW[5].value +
      allGamesW[6].value +
      allGamesW[7].value +
      allGamesW[8].value +
      allGamesW[9].value;

    // for profit

    let andharP = document.getElementById("andharP");
    let baharP = document.getElementById("baharP");
    let tieP = document.getElementById("tieP");

    andharP.innerHTML = colors.green || 0;
    baharP.innerHTML = colors.violet || 0;
    tieP.innerHTML = colors.red || 0;

    reqData.currentPageNumber = pageNumber;
    /* Display buttons */
    getPageButtons(pageCount);
  }
}

function buildAppointmentTable(tableData, runningGame) {
  let tableBody = $(".appointment-scheduled");
  // tableData.finishedGames.push(runningGame);
  tableData.finishedGames = [runningGame].concat(tableData.finishedGames);
  const player = tableData.finishedGames;
  console.log(player);
  let gameIds = 0;
  player.forEach((play) => {
    gameIds++;
  });
  console.log(gameIds);
  tableBody.empty();
  const { pageCount, orderCount, pageNumber, orders } = tableData;
  const allGames = tableData.finishedGames;
  if (gameIds == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No orders Ongoing</h2>'
    );
  } else {
    allGames.forEach((order) => {
      const { numberOfBets, totalAmountCollected, amountDistributed } = order;
      let tablerow = `
        <tr>
            <td><a  style="cursor:pointer; color:#0341fc;" href="order_details.html?gameId=${
              order.gameId
            }&parity=sp">${order.periodId}</td>
            <td>${order.numberOfBets}</td>
            <td>$${order.totalAmountCollected}</td>
            <td>$${order.amountDistributed}</td>
            <td>$${order.totalAmountCollected - order.amountDistributed}
            </td>
            <td>
                ${order.finished}
            </td>
        </tr>`;
      tableBody.append(tablerow);
    });
    reqData.currentPageNumber = pageNumber;
    /* Display buttons */
    getPageButtons(pageCount);
  }
}

function getPageButtons(pageCount, tableName) {
  $(".page-buttons").empty();

  /* Declaring next and previous page buttons */
  let previous_page_button = `
        <button class='btn btn-sm btn-primary' disabled>  
          
        </button>`;
  $(".page-buttons").append(previous_page_button);

  let next_page_button = `
        <button class='btn btn-sm btn-primary '>  
          
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
    // appointments_scheduled(reqData);
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
    appointments_scheduled(reqData);
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

function order_details_page(order_id) {
  localStorage.setItem("order_id", order_id);
  window.location.href = "order_details.html";
}

function filterOrders() {
  let gameId = document.getElementById("input-notary-name").value;
  console.log(gameId);
  let s = 0;
  async function fetchGameDetails(i) {
    s = s + i;
    if (i == 0) {
      s = 0;
    } else if (s < 0) {
      s = 0;
    }
    api_url =
      "https://sideshnew-zenwin.herokuapp.com/admin/gameView/gameDetail/" +
      gameId +
      "?gameTye=sp&skip=0";
    console.log("in here");
    console.log(s);
    let response = await fetch(api_url);
    console.log("yoman");
    if (gameId == "" || response.status !== 200) {
      $(".login-error").html("Please Fill Correct GameId! ").fadeOut(5000);
    } else {
      window.location.href =
        `order_details.html?gameId=` + gameId + `&parity=sp`;
    }
    console.log("this", response.status); // 200
    console.log(response.statusText); // OK
  }
  fetchGameDetails(0);
}

// function filterOrders() {
//     showLoader();
//     let orderInvoicetype = [];
//     [
//         ...document.querySelectorAll('input[name="input-ordertype-check"]:checked'),
//     ].forEach((order) => orderInvoicetype.push(order.value));

//     filterValues = {
//         pageNumber: reqData.pageNumber,
//         startDate: $("#input-appointment-start-date").val(),
//         endDate: $("#input-appointment-end-date").val(),
//         adminId: localStorage.getItem("adminId"),
//         orderInvoiceType: orderInvoicetype,
//         customerCompanyName: $("#input-notary-name").val(),
//         notaryName: $("#input-notary-name").val(),
//         notaryEmail: $("#input-notary-name").val(),
//         customerName: $("#input-notary-name").val(),
//         customerEmail: $("#input-notary-name").val(),
//         orderStatusStart: 2,
//         orderStatusEnd: 2
//     };

//     console.log(filterValues);
//     fetch("https://api.notarizetech.com/admin/order/filterOrders", {
//             method: "POST",
//             body: JSON.stringify(filterValues),
//             headers: {
//                 "Content-type": "application/json;charset=UTF-8",
//                 "Authorization": "Bearer " + localStorage.getItem("token"),
//             },
//         })
//         .then((response) => {
//             return response.json();
//         })
//         .then((response) => {
//             console.log(response);
//             var orders_count = document.getElementById("orders_count")
//             orders_count.innerText = response.orderCount
//             buildAppointmentscheduledTable(response)
//             hideLoader();
//         })
//         .catch((err) => {
//             swal({
//                 title: "Oops!",
//                 text: `${err}`,
//                 type: "error",
//                 icon: "error"
//             })
//         });
// }
