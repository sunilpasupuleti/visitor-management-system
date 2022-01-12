let reqData = {
  currentPageNumber: 0,
};
const url = window.location.href
var new_url = new URL(url);
var orderID = new_url.searchParams.get("orderId")
var escrow = new_url.searchParams.get("ecscrow")


function all_notery() {
  var order_escrow = document.getElementById("order_escrow")
  if (orderID) {
    order_escrow.innerText = escrow
    // console.log('es--', localStorage.getItem('escrow'), 'oid--', orderID)

    fetch(`https://api.notarizetech.com/admin/order/getNotariesToSendOrderInvite`, {
        method: "POST",
        body: JSON.stringify({
          pageNumber: reqData.currentPageNumber,
          adminId: localStorage.getItem("adminId"),
          orderId: orderID
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
        var available_Notaries = document.getElementById("available_Notaries")
        const {
          notaries,
          notaryCount
        } = response
        html = ""
        if (notaryCount == 0) {
          html = ``
          swal({
            title: "Oops!",
            text: `${response.message}`,
            type: "error",
            icon: "error"
          }).then(function(){
            window.location.href = "order_details.html"
          })
        } else {
          notaries.forEach(notary => {
            html += `
            <div style="cursor:pointer;" id="${notary._id}" class="card mt-4 mx-3 col-xl-2" onclick="notery_selected('${notary._id}')" data="True">
              <div class="card-header mt-3 d-flex justify-content-center">
                  <img alt="Image placeholder" src="${notary.userImageURL}"
                      class="avatar rounded-circle" style="width:6rem; height:6rem;"></img>
              </div>
              <div class="card-title ">
                  <p style="font-size:1rem;"><b>${notary.firstName} ${notary.lastName}</b><br>${notary.email}</p>
                  <a href="notery_details.html?notaryId=${notary._id}" style="cursor:pointer; color:#0341fc;">View Details</a>
              </div>
            </div>`
          });
        }
        available_Notaries.innerHTML = html
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
  } else {
    window.location.href = "index.html"
  }
}


all_notery()


var notery_array = []

function notery_selected(notery_id) {
  var card = document.getElementById(notery_id)
  if (card.data == "True") {
    card.data = "False"
    notery_array.push(notery_id)
    card.style = 'background: #a3ada6;'
    
  } else {
    card.data = "True"
    card.style = ""
    var notery_id_index = notery_array.indexOf(notery_id)
    delete notery_array[notery_id_index]

  }
}


function send_invite_to_notery() {
  // var orderID = localStorage.getItem("order_id")
  showMiniLoader()
  // console.log("orderID--",orderID,"notery_array--",notery_array)
  if (orderID && notery_array.length != 0) {
    fetch(`https://api.notarizetech.com/admin/order/sendOrderInvite`, {
        method: "POST",
        body: JSON.stringify({
          "notaryIdArray": notery_array,
          "adminId": localStorage.getItem("adminId"),
          "orderId": orderID
        }),
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Authorization": "Bearer " + localStorage.getItem("token")
          
        },
      })
      .then((response) => {
        return response.json();
      }).then((response) => {
        if (!response.status) {
          swal({
            title: "Oops!",
            text: `${response.message}`,
            type: "error",
            icon: "error"
          })
        }
        swal({
          title: "Great",
          text: "Notary Invited Successfully",
          type: "success",
          icon: "success"
        }).then(function () {
          window.location.href = `order_details.html?orderId=${orderID}`
        });
      })
   
  } else {
    swal({
      title: "Oops!",
      text: "Selected a NotaryOR You are not Authenticated for this action",
      type: "warning",
      icon: "warning"
    }).then(function () {
      window.location.href = `invite_notery.html?orderId=${orderID}`
    });
  }
}