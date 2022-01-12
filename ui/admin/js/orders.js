let reqData = {
  currentPageNumber: 0,
};
let game_id;

let period_id;
let end_time;

const url = window.location.href;
let s = 0;
function GetFilename(url) {
  console.log(url);
  if (url) {
    var m = url.toString().match(/.*\/(.+?)\./);
    if (m && m.length > 1) {
      return m[1];
    }
  }
  return "";
}
parity = GetFilename(url);
console.log("parity is:" + parity);

async function fetchGameData(i) {
  s = s + i;
  if (i == 0) {
    s = 0;
  } else if (s < 0) {
    s = 0;
  }
  const api_url =
    "https://sideshnew-zenwin.herokuapp.com/admin/gameView?gameType=fp&skip=" +
    s +
    "&limit=10";
  console.log(s);
  console.log("in here");
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
    console.log(data);
    end_time = new Date(data.runningGameDetails.endTime);
    period_id = data.runningGame.periodId;

    setCountdown();

    const runnningGame = {
      numberOfBets: data.runningGame.numberOfBets,
      totalAmountCollected: data.runningGame.totalAmountCollected,
      amountDistributed: data.runningGame.amountDistributed,
      finished: data.runningGame.finished,
      gameId: data.runningGame.gameId,
      periodId: data.runningGame.periodId,
    };
    game_id = runnningGame.gameId;
    console.log("hey that's", game_id);

    buildAppointmentTable(data, runnningGame);
    hideLoader();
  }
}

function setCountdown() {
  var countDownDate = end_time.getTime();

  var x = setInterval(() => {
    console.log("sdsds");
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
let t = 12;
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
      console.log("helo");
      return response;
    })
    .then((response) => {
      console.log("first", response);
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
      swal({
        title: "Oops",
        text: `Error in fetching Data Refresh Page `,
        type: "error",
        icon: "error",
      }).then(() => window.location.reload());
    });
  // t=t-1;
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

function orders_unassigned() {
  fetch(`https://api.notarizetech.com/admin/order/getUnassignedOrders`, {
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
      buildAppointmentTable(response);
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

// orders_unassigned()

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
  console.log(gameIds);
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
    let green = document.getElementById("green");
    let violet = document.getElementById("violet");
    let red = document.getElementById("red");
    let total = document.getElementById("total");

    let zero_red_violet = document.getElementById("0red/violet");
    let one_green = document.getElementById("1green");
    let two_red = document.getElementById("2red");
    let three_green = document.getElementById("3green");
    let four_red = document.getElementById("4red");
    let five_green_violet = document.getElementById("5green/violet");
    let six_red = document.getElementById("6red");
    let seven_green = document.getElementById("7green");
    let eight_red = document.getElementById("8red");
    let nine_green = document.getElementById("9green");

    green.innerHTML = colors.green || 0;
    violet.innerHTML = colors.violet || 0;
    red.innerHTML = colors.red || 0;

    zero_red_violet.innerHTML = allGames[5].value;
    one_green.innerHTML = allGames[0].value;
    two_red.innerHTML = allGames[6].value;
    three_green.innerHTML = allGames[1].value;
    four_red.innerHTML = allGames[7].value;
    five_green_violet.innerHTML = allGames[4].value;
    six_red.innerHTML = allGames[8].value;
    seven_green.innerHTML = allGames[2].value;
    eight_red.innerHTML = allGames[9].value;
    nine_green.innerHTML = allGames[3].value;
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

    let greenW = document.getElementById("greenW");
    let violetW = document.getElementById("violetW");
    let redW = document.getElementById("redW");
    let totalW = document.getElementById("totalW");

    let zero_red_violetW = document.getElementById("0red/violetW");
    let one_greenW = document.getElementById("1greenW");
    let two_redW = document.getElementById("2redW");
    let three_greenW = document.getElementById("3greenW");
    let four_redW = document.getElementById("4redW");
    let five_green_violetW = document.getElementById("5green/violetW");
    let six_redW = document.getElementById("6redW");
    let seven_greenW = document.getElementById("7greenW");
    let eight_redW = document.getElementById("8redW");
    let nine_greenW = document.getElementById("9greenW");

    greenW.innerHTML = colors.green || 0;
    violetW.innerHTML = colors.violet || 0;
    redW.innerHTML = colors.red || 0;

    zero_red_violetW.innerHTML = allGamesW[5].value;
    one_greenW.innerHTML = allGamesW[0].value;
    two_redW.innerHTML = allGamesW[6].value;
    three_greenW.innerHTML = allGamesW[1].value;
    four_redW.innerHTML = allGamesW[7].value;
    five_green_violetW.innerHTML = allGamesW[4].value;
    six_redW.innerHTML = allGamesW[8].value;
    seven_greenW.innerHTML = allGamesW[2].value;
    eight_redW.innerHTML = allGamesW[9].value;
    nine_greenW.innerHTML = allGamesW[3].value;
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

    let greenP = document.getElementById("greenP");
    let violetP = document.getElementById("violetP");
    let redP = document.getElementById("redP");

    let zero_red_violetP = document.getElementById("0red/violetP");
    let one_greenP = document.getElementById("1greenP");
    let two_redP = document.getElementById("2redP");
    let three_greenP = document.getElementById("3greenP");
    let four_redP = document.getElementById("4redP");
    let five_green_violetP = document.getElementById("5green/violetP");
    let six_redP = document.getElementById("6redP");
    let seven_greenP = document.getElementById("7greenP");
    let eight_redP = document.getElementById("8redP");
    let nine_greenP = document.getElementById("9greenP");

    greenP.innerHTML = colors.green || 0;
    violetP.innerHTML = colors.violet || 0;
    redP.innerHTML = colors.red || 0;
    zero_red_violetP.innerHTML = allGamesW[5].value - allGames[5].value;
    one_greenP.innerHTML = allGamesW[0].value - allGames[0].value;
    two_redP.innerHTML = allGamesW[6].value - allGames[6].value;
    three_greenP.innerHTML = allGamesW[1].value - allGames[1].value;
    four_redP.innerHTML = allGamesW[7].value - allGames[7].value;
    five_green_violetP.innerHTML = allGamesW[4].value - allGames[4].value;
    six_redP.innerHTML = allGamesW[8].value - allGames[8].value;
    seven_greenP.innerHTML = allGamesW[2].value - allGames[2].value;
    eight_redP.innerHTML = allGamesW[9].value - allGames[9].value;
    nine_greenP.innerHTML = allGamesW[3].value - allGames[3].value;

    reqData.currentPageNumber = pageNumber;
    /* Display buttons */
    getPageButtons(pageCount);
  }
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

function buildAppointmentTable(tableData, runningGame) {
  console.log(tableData);
  // console.log(tableData.runningGame.gameId);
  // console.log(tableData.runningGame.numberOfBets);
  // console.log(tableData.runningGame.totalAmountCollected);
  // console.log(tableData.runningGame.amountDistributed);
  // console.log(tableData.runningGame.finished);
  // console.log();
  // tableData.finishedGames.push(runningGame);
  tableData.finishedGames = [runningGame].concat(tableData.finishedGames);
  console.log("this", runningGame);
  let tableBody = $(".appointment-completed");
  const gameIds = tableData.finishedGames.length;
  console.log(gameIds);
  tableBody.empty();
  const { pageCount, orderCount, pageNumber, orders } = tableData;
  const allGames = tableData.finishedGames;
  if (gameIds == 0) {
    console.log("null");
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No orders Ongoing</h2>'
    );
  } else {
    allGames.forEach((order) => {
      const { amount, appointment, customer } = order;
      let tablerow = `
        <tr>
            <td><a  style="cursor:pointer; color:#0341fc;" href="order_details.html?gameId=${
              order.gameId
            }&parity=sp">${order.periodId}</a></td>
            <td>${order.numberOfBets}</td>
            <td>$${order.totalAmountCollected}</td>
            <td>$${order.amountDistributed}</td>
            <td>$${order.totalAmountCollected - order.amountDistributed}</td>
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
    // orders_unassigned(reqData);
    $(`[value = ${reqData.currentPageNumber}]`).addClass("active");
  });

  $(".next-page-btn").on("click", () => {
    $("tbody").empty();
    // s=10;
    // fetchGameData();
    /* showMiniLoader(); */
    if (reqData.currentPageNumber != 1) {
      $(".previous-page-btn").attr("disabled", false);
    }
    let nextPageNumber = reqData.currentPageNumber + 1;
    reqData.currentPageNumber = nextPageNumber;
    orders_unassigned(reqData);
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
    let response = await fetch(api_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    console.log("yo");
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
