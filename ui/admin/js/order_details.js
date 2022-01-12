const url = window.location.href;
var new_url = new URL(url);
var gameDetailId = new_url.searchParams.get("gameId");
var parity = new_url.searchParams.get("parity");
console.log(parity);
console.log(gameDetailId);
let api_url =
  "https://sideshnew-zenwin.herokuapp.com/admin/gameView/gameDetail/" +
  gameDetailId +
  "?gameTye=sp&skip=0";
console.log(gameDetailId);
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
    gameDetailId +
    "?gameTye=sp&skip=" +
    s;
  console.log("in here");
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
    console.log(data);
    var total_amount = 0;

    for (var i = 0; i < data.length; i++) {
      total_amount += data.userBetDetails[i].amountBetted;
    }
    console.log("toal amount is: " + total_amount);
    if (data.gameresult != null) {
      console.log(data.gameresult.profit);
      document.getElementById("gameDetailId").innerHTML = gameDetailId;
      document.getElementById("colorwon").innerHTML = data.gameresult.colorWon;
      document.getElementById("numberwon").innerHTML =
        data.gameresult.numberWon;
      document.getElementById("totalProfit").innerHTML = data.gameresult.profit;
    }

    buildAppointmentTable(data);

    // hideLoader()
  }
}
fetchGameDetails(0);

function buildAppointmentTable(tableData) {
  document.getElementById("total-bets").innerHTML =
    "Total Bets:" + tableData.userBetDetails.length;
  console.log("this one talking about", tableData.userBetDetails);
  let tableBody = $(".game-bet-details");
  const gameIds = tableData;
  console.log(gameIds);
  tableBody.empty();
  const { pageCount, orderCount, pageNumber, orders } = tableData;
  const allGames = tableData.userBetDetails;
  console.log("this" + allGames[0]);
  if (allGames.length == 0) {
    console.log("null");
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No more bets</h2>'
    );
  } else {
    allGames.forEach((order) => {
      const { userId, betType, amountBetted, won, winnigAmount } = order;
      let tempo;
      if (order.colorBettedOn) {
        tempo = order.colorBettedOn;
      } else {
        tempo = order.numberBettedOn;
      }
      let tablerow = `
        <tr>
        <th>${order._id}</th>
            <td><a style="cursor:pointer; color:#71EFA3;" href="client_profile.html?customerId=${userId}">${userId}</a></td>
            <td>${betType}:${tempo}</td>
            <td>₹${amountBetted}</td>
            <td>${won ? "Won" : "Lost"}</td>
            </td>
            <td>
                ${winnigAmount}
            </td>
        </tr>`;
      tableBody.append(tablerow);
    });
    // reqData.currentPageNumber = pageNumber
    /* Display buttons */
    // getPageButtons(pageCount);
  }
}
// details();

$("#chat-div").css("display", "none");
$("#minimise").click(function () {
  $("#chat-div").css("display", "none");
  $("#chatBtn").css("display", "block");
  $(".chat-pop").css("display", "block");
});

// function cancelOrder(orderId, escrow, customerId) {

//     console.log("orderId--", orderId, "customerId--", customerId)

//     swal({
//             title: "Are you sure?",
//             text: `You want to Cancel Order ${escrow} `,
//             icon: "warning",
//             type: "warning",
//             buttons: true,
//             dangerMode: true,
//         })
//         .then((willDelete) => {
//             if (willDelete) {
//                 showLoader()
//                 fetch(`https://api.notarizetech.com/customer/cancelOrder`, {
//                         method: "POST",
//                         body: JSON.stringify({
//                             orderIdToCancel: orderId,
//                             confirmCancel: true,
//                             adminId: localStorage.getItem("adminId"),
//                             customerId: customerId
//                         }),
//                         headers: {
//                             "Content-Type": "application/json;charset=UTF-8",
//                             "Authorization": "Bearer " + localStorage.getItem("token")

//                         },
//                     })
//                     .then((response) => {
//                         return response.json();
//                     })
//                     .then((response) => {
//                         console.log("cancel respoce--", response)
//                         if (!response.status) {
//                             swal({
//                                 title: "Oops",
//                                 text: `${response.message}`,
//                                 type: "error",
//                                 icon: "error"
//                             });
//                             hideLoader()
//                         } else {
//                             swal({
//                                 title: "",
//                                 text: `Order Canceled Successfully`,
//                                 type: "success",
//                                 icon: "success"
//                             }).then(function() {
//                                 window.location.href = "./appointment_canceled.html"
//                             })
//                         }

//                     })
//                     .catch((err) => {
//                         swal({
//                             title: "Oops",
//                             text: `Error in fetching Data ${err}`,
//                             type: "error",
//                             icon: "error"
//                         });
//                         hideLoader()
//                     });

//             }
//         });
// }
