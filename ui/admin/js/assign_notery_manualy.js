let reqData = {
  currentPageNumber: 0,
};
const url = window.location.href
var new_url = new URL(url);
var orderID = new_url.searchParams.get("orderId")
var escrow = new_url.searchParams.get("ecscrow")

function all_notery() {
  // var orderID = localStorage.getItem("order_id")
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
          }).then(function () {
            window.location.href = `order_details.html?orderId=${orderID}`
          })
        } else {
          notaries.forEach(notary => {
            html += `
            <div id="${notary._id}" class="card mt-4 mx-3 col-xl-2" onclick="assign_notary('${notary._id}','${notary.email}')" data="True">
              <div class="card-header mt-3 d-flex justify-content-center">
                  <img alt="Image placeholder" src="${notary.userImageURL}"
                      class="avatar rounded-circle" style="width:6rem; height:6rem;"></img>
              </div>
              <div class="card-title">
                  <p style="font-size:1rem;"><b>${notary.firstName} ${notary.lastName}</b><br>${notary.email}</p>
              </div>
            </div>`
          });
        }
        available_Notaries.innerHTML = html
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
  } else {
    window.location.href = "index.html"
  }
}


all_notery()



function assign_notary(notary_id, notary_email) {
  var notery_selected = document.getElementById(notary_id)
  notery_selected.style = "background-color:#a3ada6;"
  swal({
      title: "Are you sure?",
      text: `You want to invite ${notary_email} notary`,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        showLoader()
        fetch(`https://api.notarizetech.com/admin/order/manuallyAssignOrder`, {
              method: "POST",
              body: JSON.stringify({
                "adminId": localStorage.getItem("adminId"),
                "orderId": orderID,
                "notaryId": notary_id
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
              if (response.status == 0) {
                swal({
                  title: "Oops!",
                  text: `${response.message}`,
                  type: "error",
                  icon: "error"
                }).then(function () {
                  notery_selected.style = "background-color:"
                  hideLoader()
                })
              } else {
                console.log(response);
                swal({
                  title: "Great",
                  text: "Invite Sent",
                  type: "success",
                  icon: "success"
                }).then(function () {
                  window.location.href = `order_details.html?orderId=${orderID}`
                });
              }


            })
            .catch((err) => {
              swal({
                title: "Oops!",
                text: `${err}`,
                type: "error",
                icon: "error"
              })
              .then(function () {
                notery_selected.style = "background-color:"
                hideLoader()
              });
            });

      } else {
        swal({
          title: "",
          text: "Select another Notery",
          type: "info",
          icon: "info"
        }).then(function () {
          hideLoader()
          notery_selected.style = "background-color:"
        });
      }
    });

}