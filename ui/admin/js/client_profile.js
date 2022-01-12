// var customer_id = localStorage.getItem("customer_id");
let reqData = {
  currentPageNumber: 0,
};
let mobileNo = 0;
let userName = "undefined";
const url = window.location.href;
var new_url = new URL(url);
var customer_id = new_url.searchParams.get("customerId");
console.log(customer_id);

async function setAmount(id) {
  console.log(id);
  console.log($("#input-wallet-amount").val());
  const api_url =
    "https://sideshnew-zenwin.herokuapp.com/user/setWalletAmount?userId=" + id;
  // console.log(s)
  let response = await fetch(api_url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: {},
  });

  if (response.status === 200) {
    let data = await response.json();
  }

  swal({
    title: "Updated Successfully",
    type: "success",
    icon: "success",
  }).then(function () {});
}

async function onDeleteUser(id) {
  const api_url = "https://sideshnew-zenwin.herokuapp.com/user/deleteCustomer";
  // console.log(s)
  let response = await fetch(api_url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({ userId: id }),
  });

  if (response.status === 200) {
    let data = await response.json();
  }

  swal({
    title: "Deleted Successfully",
    type: "success",
    icon: "success",
  }).then(function () {});

  location.reload();
}

if (customer_id) {
  function profile() {
    var profile = document.getElementById("profile");
    var settings = {
      url:
        "https://sideshnew-zenwin.herokuapp.com/admin/user/detail?userId=" +
        customer_id,
      method: "GET", // rohit make it get api at last
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      data: JSON.stringify({
        userId: customer_id,
      }),
    };

    $.ajax(settings).done(function (response) {
      console.log("response--", response);
      mobileNo = response.mobile;
      userName = response.fullName;
      localStorage.setItem("customerData", JSON.stringify(response));
      // document.getElementById("delete_client").setAttribute("onclick",`deleteClient('${response._id}')`)
      // document.getElementById("create_order").setAttribute("href",`newsigningrequest.html?customerId=${customer_id}&name=${response.fullName}`)
      profile.innerHTML = `
            <div class="card-body">
              <h4 class="text-dark mb-4">Client information</h4>
              <br>
              
              <button type="button" class="btn btn-danger" onclick="onDeleteUser('${
                response._id
              }')" ><i class="fas fa-pencil-alt mx-2"></i>Delete User</button>

              <div class="card-header d-flex justify-content-center">
                <img class="avatar rounded-circle" style="width:6rem; height:6rem;"></img>
              </div>
                <div class="pl-lg-4">
                  <div class="row">
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="form-control-label" for="input-first-name">First name</label>
                        <input type="text" id="input-first-name" class="form-control font-weight-bold" placeholder="First name" value="${
                          response.user.fullName.split(" ")[0]
                        }" required readonly>
                      </div>
                    </div>
                    <div class="col-lg-6">
                   
                    <div class="form-group">
                         <label class="form-control-label" for="input-last-name">Last name</label>
                         <input type="text" id="input-last-name" class="form-control font-weight-bold" placeholder="Last name" value="${
                           response.user.fullName.split(" ")[1]
                         }" required readonly>
                      </div>
                    </div>
                   </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="form-control-label" for="input-username">Phone No.</label>
                        <input type="tel" id="input-phone" class="form-control font-weight-bold" placeholder="Phone Number" value="${
                          response.user.mobile
                        }" required readonly>
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="form-control-label" for="input-email">Email address</label>
                        <input type="email" id="input-email" class="form-control font-weight-bold" value="${
                          response.user.emailVerified
                        }" required readonly>
                      </div>
                    </div>
                  
                    <div class="col-md-12">
                      <div class="form-group">
                        <label class="form-control-label" for="input-address">userId</label>
                        <input id="input-address" class="form-control font-weight-bold" placeholder="Home Address" value="${
                          response.user._id
                        }" type="text" required readonly>
                      </div>
                    </div>
                       
                    <div class="col-lg-6">
                    
                      <div class="form-group">
                        <label class="form-control-label" for="input-wallet-amount">Wallet Amount</label>
                        <input type="text" id="input-wallet-amount" class="form-control font-weight-bold" placeholder="Wallet amount" value="${
                          response.userdash.wallet
                        }" required >
                      </div>
                    </div>

                  </div>
                  <div class="row">
                  
                    
                  
                    <div class="col-lg-12 d-flex justify-content-center">

                    <button type="button" class="btn btn-primary" onclick="setAmount('${
                      response.user._id
                    }')" ><i class="fas fa-pencil-alt mx-2"></i>Set Amount</button>

            
                    </div>
                  </div>

                  </div>
                </div>
            </div>
          
    `;
      hideLoader();
    });
  }

  let s = 0;
  let s1 = 0;
  function client_transactions(typeOfTransaction, i) {
    var profile = document.getElementById("profile");
    if (typeOfTransaction == 0) {
      console.log(s);
      s = s + i;
      console.log(s);
      if (i == 0) {
        s = 0;
      } else if (s < 0) {
        s = 0;
      }
      let url =
        `https://sideshnew-zenwin.herokuapp.com/admin/payment/rechargeRequestList/user?mobile=` +
        mobileNo +
        `&limit=10&skip=` +
        s +
        `&status=rejected`;
      profile.innerHTML = `
    <div id="myModal" class="modal">
    <span class="close"><button onclick="closeSS()">Close</button></span>
    <img class="ssZoom" id="img01">
    </div>
    <div class="card-header border-0">
    <div class="col-xl-12 mt-2">
        <ul class="nav nav-pills justify-content-start">
            <li class="nav-item mt-2">
                <a href="#" onclick="showTransactions('pending',0)" data-toggle="tab" class="btn nav-link py-2 px-3 active">
                    <span class="d-none d-md-block" id="fs">Pending Recharges (<span
                            id="orders_count"></span>)</span>
                    <span class="d-md-none">Pending Recharges</span>
                </a>
            </li>
            <li class="nav-item mt-2">
                <a href="#"  onclick="showTransactions('approved',0)" data-toggle="tab" class="btn nav-link py-2 px-3">
                    <span class="d-none d-md-block" id="sp">Approved Recharges</span>
                    <span class="d-md-none">Approved Recharges</span>
                </a>
            </li>
          <li class="nav-item mt-2">
                <a href="#" onclick="showTransactions('rejected',0)" data-toggle="tab" class="btn nav-link py-2 px-3">
                    <span class="d-none d-md-block">Rejected Recharges</span>
                    <span class="d-md-none">Rejected Recharges</span>
                </a>
            </li> 
        </ul>
    </div>
</div>

        
    `;
      let tableBody = $(".order-list");
      tableBody.empty();

      fetch(url, {
        method: "GET",
      })
        .then((response) => {
          console.log(response);
          console.log("response.status", response.status);
          // let response=response.json()
          // let status=response.status
          // return {
          //   response,
          //   status
          // };
          return response.json();
        })
        .then((response, status) => {
          if (!response) {
            swal({
              title: "Oops!",
              text: `${response.message}`,
              type: "error",
              icon: "error",
            });
          }
          console.log("this", response);
          // if we reach the end of object and didn't have any elements to show after
          if (response.length == 0) {
            tableBody.html(
              '<h2 class="d-flex justify-content-center mt-3">No Data Available</h2>'
            );
            // client_transactions(0,-10)
          }
          response.forEach((res) => {
            let tableRow = `
            <tr>
              
              <td>${res.amount}</td>
              <td><img onclick="abc(this.src)"  src=${res.screenShotUrl} class="screenshot avatar rounded-circle" style="width:4rem; height:4rem;"></img></td>
              <td>${res.status}</td>
              <td>${res._id}</td>
            </tr>`;
            tableBody.append(tableRow);
          });
          /* function to render table */

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
      console.log(url);
    } else if (typeOfTransaction == 1) {
      console.log("hello");
      var profile = document.getElementById("profile");
      console.log(s1);
      s1 = s1 + i;
      console.log(s1);
      if (i == 0) {
        s1 = 0;
      } else if (s1 < 0) {
        s1 = 0;
      }
      let url =
        `https://sideshnew-zenwin.herokuapp.com/admin/payment/withdrawalRequestList/user?mobile=` +
        mobileNo +
        `&limit=10&skip=` +
        s1;
      profile.innerHTML = `
      <div id="myModal" class="modal">
      <span class="close"><button onclick="closeSS()">Close</button></span>
      <img class="ssZoom" id="img01">
      </div>
      <div class="card-header border-0">
      <div class="col-xl-12 mt-2">
          <ul class="nav nav-pills justify-content-start">
              <li class="nav-item mt-2">
                  <a href="#" onclick="showWithdrawalTransactions('pending',0)" data-toggle="tab" class="btn nav-link py-2 px-3 active">
                      <span class="d-none d-md-block" id="fs">Pending Recharges (<span
                              id="orders_count"></span>)</span>
                      <span class="d-md-none">Pending Recharges</span>
                  </a>
              </li>
              <li class="nav-item mt-2">
                  <a href="#"  onclick="showWithdrawalTransactions('approved',0)" data-toggle="tab" class="btn nav-link py-2 px-3">
                      <span class="d-none d-md-block" id="sp">Approved Recharges</span>
                      <span class="d-md-none">Approved Recharges</span>
                  </a>
              </li>
            <li class="nav-item mt-2">
                  <a href="#" onclick="showWithdrawalTransactions('rejected',0)" data-toggle="tab" class="btn nav-link py-2 px-3">
                      <span class="d-none d-md-block">Rejected Recharges</span>
                      <span class="d-md-none">Rejected Recharges</span>
                  </a>
              </li> 
          </ul>
      </div>
  </div>`;

      let tableBody = $(".order-list");
      tableBody.empty();

      fetch(url, {
        method: "GET",
      })
        .then((response) => {
          console.log(response);
          console.log("response.status", response.status);
          // let response=response.json()
          // let status=response.status
          // return {
          //   response,
          //   status
          // };
          return response.json();
        })
        .then((response, status) => {
          if (!response) {
            swal({
              title: "Oops!",
              text: `${response.message}`,
              type: "error",
              icon: "error",
            });
          }
          console.log("this", response);
          if (response.length == 0) {
            tableBody.html(
              '<h2 class="d-flex justify-content-center mt-3">No Data Available</h2>'
            );
          }
          response.forEach((res) => {
            let tableRow = `
        <tr>
          <th>${res.upiId}</th>
          <td>${res.amount}</td>
          <td>${res.status}</td>
        </tr>`;
            tableBody.append(tableRow);
          });
          /* function to render table */

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
    console.log("url after clicking", url);

    console.log("hello");
    console.log("mobileNo=", mobileNo);

    document.getElementById("userName").innerHTML = userName;
    showLoader();
  }

  let s2 = 0;
  let s3 = 0;
  let s4 = 0;
  function showTransactions(typeOfTransaction, i) {
    var profile = document.getElementById("profile");
    if (typeOfTransaction == "pending") {
      profile.innerHTML = `
      <div id="myModal" class="modal">
    <span class="close"><button onclick="closeSS()">Close</button></span>
    <img class="ssZoom" id="img01">
    </div>
      <div class="card-header border-0">
    <div class="col-xl-12 mt-2">
        <ul class="nav nav-pills justify-content-start">
        <li class="nav-item mt-2">
        <a href="#" onclick="showTransactions('pending',0)" data-toggle="tab" class="btn nav-link py-2 px-3 active">
            <span class="d-none d-md-block" id="fs">Pending Recharges (<span
                    id="orders_count"></span>)</span>
            <span class="d-md-none">Pending Recharges</span>
        </a>
    </li>
            <li class="nav-item mt-2">
                <a href="#"  onclick="showTransactions('approved',0)" data-toggle="tab" class="btn nav-link py-2 px-3">
                    <span class="d-none d-md-block" id="sp">Approved Recharges</span>
                    <span class="d-md-none">Approved Recharges</span>
                </a>
            </li>
          <li class="nav-item mt-2">
                <a href="#" onclick="showTransactions('rejected',0)" data-toggle="tab" class="btn nav-link py-2 px-3">
                    <span class="d-none d-md-block">Rejected Recharges</span>
                    <span class="d-md-none">Rejected Recharges</span>
                </a>
            </li> 
        </ul>
    </div>
</div>
      <div class="col" id="order-completed-table">
      <div class="card table-flush">
        <div class="table-responsive">
          <table class="table align-items-center" id="invoice_table">
            <thead class="thead">
              <tr>
                <th><b class="text-dark">Transaction ID</b></th>
                <th><b class="text-dark">User ID</b></th>
                <th><b class="text-dark">User Name</b></th>
                <th><b class="text-dark">Recharge Amount</b></th>
                <th><b class="text-dark">Approve</b></th>
                <th><b class="text-dark">Reject</b></th>
                <th><b class="text-dark">Reject Reason</b></th>
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
      s4 = s4 + i;
      console.log("hi", s4);
      if (i == 0) {
        s4 = 0;
      } else if (s4 < 0) {
        s4 = 0;
      }
      fetch(
        `https://sideshnew-zenwin.herokuapp.com/admin/payment/rechargeRequestList/user?mobile=` +
          mobileNo +
          `&limit=10&skip=` +
          s4 +
          `&status=pending`,
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
    } else if (typeOfTransaction == "approved") {
      profile.innerHTML = `
      <div id="myModal" class="modal">
    <span class="close"><button onclick="closeSS()">Close</button></span>
    <img class="ssZoom" id="img01">
    </div>
      <div class="card-header border-0">
    <div class="col-xl-12 mt-2">
        <ul class="nav nav-pills justify-content-start">
            <li class="nav-item mt-2">
                <a href="#" onclick="showTransactions('pending',0)" data-toggle="tab" class="btn nav-link py-2 px-3 ">
                    <span class="d-none d-md-block" id="fs">Pending Recharges (<span
                            id="orders_count"></span>)</span>
                    <span class="d-md-none">Pending Recharges</span>
                </a>
            </li>
            <li class="nav-item mt-2">
                <a href="#"  onclick="showTransactions('approved',0)" data-toggle="tab" class="btn nav-link py-2 px-3 active">
                    <span class="d-none d-md-block" id="sp">Approved Recharges</span>
                    <span class="d-md-none">Approved Recharges</span>
                </a>
            </li>
          <li class="nav-item mt-2">
                <a href="#" onclick="showTransactions('rejected',0)" data-toggle="tab" class="btn nav-link py-2 px-3">
                    <span class="d-none d-md-block">Rejected Recharges</span>
                    <span class="d-md-none">Rejected Recharges</span>
                </a>
            </li> 
        </ul>
    </div>
</div>
      <div class="col" id="order-completed-table">
      <div class="card table-flush">
        <div class="table-responsive">
          <table class="table align-items-center" id="invoice_table">
            <thead class="thead">
              <tr>
                <th><b class="text-dark">Transaction ID</b></th>
                <th><b class="text-dark">User ID</b></th>
                <th><b class="text-dark">User Name</b></th>
                <th><b class="text-dark">Recharge Amount</b></th>
                <th><b class="text-dark">Approved By</b></th>
                <th><b class="text-dark">Approved On</b></th>
              </tr>
            </thead>
            <tbody class="list invoices-list"></tbody>
          </table>
          <button class="btn btn-sm btn-primary" onclick="showTransactions('approved',-10)" style="float:center;margin-left: 45%; ">prev</button>
          <button class="btn btn-sm btn-primary" onclick="showTransactions('approved',0)" style="float:center; ">1</button>
          
          <button class="btn btn-sm btn-primary" onclick="showTransactions('approved',10)" style="float:center;">next</button>
        </div>
      </div>`;
      s3 = s3 + i;
      console.log("hi", s3);
      if (i == 0) {
        s3 = 0;
      } else if (s3 < 0) {
        s3 = 0;
      }
      fetch(
        `https://sideshnew-zenwin.herokuapp.com/admin/payment/rechargeRequestList/user?limit=10&mobile=` +
          mobileNo +
          `&skip=` +
          s3 +
          `&status=approved`,
        {
          method: "GET",
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
          buildApproveTable(response);
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
    } else if (typeOfTransaction == "rejected") {
      profile.innerHTML = `
      <div id="myModal" class="modal">
    <span class="close"><button onclick="closeSS()">Close</button></span>
    <img class="ssZoom" id="img01">
    </div>
      <div class="card-header border-0">
    <div class="col-xl-12 mt-2">
        <ul class="nav nav-pills justify-content-start">
            <li class="nav-item mt-2">
                <a href="#" onclick="showTransactions('pending',0)" data-toggle="tab" class="btn nav-link py-2 px-3 ">
                    <span class="d-none d-md-block" id="fs">Pending Recharges (<span
                            id="orders_count"></span>)</span>
                    <span class="d-md-none">Pending Recharges</span>
                </a>
            </li>
            <li class="nav-item mt-2">
                <a href="#"  onclick="showTransactions('approved',0)" data-toggle="tab" class="btn nav-link py-2 px-3">
                    <span class="d-none d-md-block" id="sp">Approved Recharges</span>
                    <span class="d-md-none">Approved Recharges</span>
                </a>
            </li>
          <li class="nav-item mt-2">
                <a href="#" onclick="showTransactions('rejected',0)" data-toggle="tab" class="btn nav-link py-2 px-3 active">
                    <span class="d-none d-md-block">Rejected Recharges</span>
                    <span class="d-md-none">Rejected Recharges</span>
                </a>
            </li> 
        </ul>
    </div>
</div>
      <div class="col" id="order-completed-table">
      <div class="card table-flush">
        <div class="table-responsive">
          <table class="table align-items-center" id="invoice_table">
            <thead class="thead">
              <tr>
                <th><b class="text-dark">Transaction ID</b></th>
                <th><b class="text-dark">User ID</b></th>
                <th><b class="text-dark">User Name</b></th>
                <th><b class="text-dark">Recharge Amount</b></th>
                <th><b class="text-dark">Rejected By</b></th>
                <th><b class="text-dark">Rejected Reason</b></th>
                <th><b class="text-dark">Reject Reason</b></th>
              </tr>
            </thead>
            <tbody class="list invoices-list"></tbody>
          </table>
        </div>
        <div class="card-footer py-4">
        <button class="btn btn-sm btn-primary" onclick="showTransactions('rejected',-10)" style="float:center;margin-left: 45%; ">prev</button>
        <button class="btn btn-sm btn-primary" onclick="showTransactions('rejected',0)" style="float:center; ">1</button>
        
        <button class="btn btn-sm btn-primary" onclick="showTransactions('rejected',10)" style="float:center;">next</button>
        </div>
      </div>`;

      s2 = s2 + i;
      console.log("hi", s2);
      if (i == 0) {
        s2 = 0;
      } else if (s2 < 0) {
        s2 = 0;
      }
      fetch(
        `https://sideshnew-zenwin.herokuapp.com/admin/payment/rechargeRequestList/user?mobile=` +
          mobileNo +
          `&limit=10&skip=` +
          s2 +
          `&status=rejected`,
        {
          method: "GET",
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
          buildRejectTable(response);
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
  }

  let s5 = 0;
  let s6 = 0;
  let s7 = 0;
  function showWithdrawalTransactions(typeOfTransaction, i) {
    var profile = document.getElementById("profile");
    if (typeOfTransaction == "pending") {
      profile.innerHTML = `
      <div id="myModal" class="modal">
    <span class="close"><button onclick="closeSS()">Close</button></span>
    <img class="ssZoom" id="img01">
    </div>
      <div class="card-header border-0">
    <div class="col-xl-12 mt-2">
        <ul class="nav nav-pills justify-content-start">
        <li class="nav-item mt-2">
        <a href="#" onclick="showWithdrawalTransactions('pending',0)" data-toggle="tab" class="btn nav-link py-2 px-3 active">
            <span class="d-none d-md-block" id="fs">Pending Recharges (<span
                    id="orders_count"></span>)</span>
            <span class="d-md-none">Pending Recharges</span>
        </a>
    </li>
            <li class="nav-item mt-2">
                <a href="#"  onclick="showWithdrawalTransactions('approved',0)" data-toggle="tab" class="btn nav-link py-2 px-3">
                    <span class="d-none d-md-block" id="sp">Approved Recharges</span>
                    <span class="d-md-none">Approved Recharges</span>
                </a>
            </li>
          <li class="nav-item mt-2">
                <a href="#" onclick="showWithdrawalTransactions('rejected',0)" data-toggle="tab" class="btn nav-link py-2 px-3">
                    <span class="d-none d-md-block">Rejected Recharges</span>
                    <span class="d-md-none">Rejected Recharges</span>
                </a>
            </li> 
        </ul>
    </div>
</div>
      <div class="col" id="order-completed-table">
      <div class="card table-flush">
        <div class="table-responsive">
          <table class="table align-items-center" id="invoice_table">
            <thead class="thead">
              <tr>
                <th><b class="text-dark">Transaction ID</b></th>
                <th><b class="text-dark">Recharge Amount</b></th>
                <th><b class="text-dark">Approve</b></th>
                <th><b class="text-dark">Reject</b></th>
                <th><b class="text-dark">Reject Reason</b></th>
              </tr>
            </thead>
            <tbody class="list invoices-list"></tbody>
          </table>
        </div>
        <div class="card-footer py-4">
        <button class="btn btn-sm btn-primary" onclick="showWithdrawalTransactions('pending',-10)" style="float:center;margin-left: 45%; ">prev</button>
        <button class="btn btn-sm btn-primary" onclick="showWithdrawalTransactions('pending',0)" style="float:center; ">1</button>
        
        <button class="btn btn-sm btn-primary" onclick="showWithdrawalTransactions('pending',10)" style="float:center;">next</button>
      </div>
      </div>`;
      s5 = s5 + i;
      console.log("hi", s5);
      if (i == 0) {
        s5 = 0;
      } else if (s5 < 0) {
        s5 = 0;
      }
      fetch(
        `https://sideshnew-zenwin.herokuapp.com/admin/payment/withdrawalRequestList/user?mobile=` +
          mobileNo +
          `&limit=10&skip=` +
          s5 +
          `&status=pending`,
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
          buildWithdrawalInvoiceTable(response);
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
    } else if (typeOfTransaction == "approved") {
      profile.innerHTML = `
      <div id="myModal" class="modal">
    <span class="close"><button onclick="closeSS()">Close</button></span>
    <img class="ssZoom" id="img01">
    </div>
      <div class="card-header border-0">
    <div class="col-xl-12 mt-2">
        <ul class="nav nav-pills justify-content-start">
            <li class="nav-item mt-2">
                <a href="#" onclick="showWithdrawalTransactions('pending',0)" data-toggle="tab" class="btn nav-link py-2 px-3 ">
                    <span class="d-none d-md-block" id="fs">Pending Recharges (<span
                            id="orders_count"></span>)</span>
                    <span class="d-md-none">Pending Recharges</span>
                </a>
            </li>
            <li class="nav-item mt-2">
                <a href="#"  onclick="showWithdrawalTransactions('approved',0)" data-toggle="tab" class="btn nav-link py-2 px-3 active">
                    <span class="d-none d-md-block" id="sp">Approved Recharges</span>
                    <span class="d-md-none">Approved Recharges</span>
                </a>
            </li>
          <li class="nav-item mt-2">
                <a href="#" onclick="showWithdrawalTransactions('rejected',0)" data-toggle="tab" class="btn nav-link py-2 px-3">
                    <span class="d-none d-md-block">Rejected Recharges</span>
                    <span class="d-md-none">Rejected Recharges</span>
                </a>
            </li> 
        </ul>
    </div>
</div>
      <div class="col" id="order-completed-table">
      <div class="card table-flush">
        <div class="table-responsive">
          <table class="table align-items-center" id="invoice_table">
            <thead class="thead">
              <tr>
                <th><b class="text-dark">Transaction ID</b></th>
                <th><b class="text-dark">Withdrawal Amount</b></th>
                <th><b class="text-dark">UPI Id</b></th>
                <th><b class="text-dark">Approved By</b></th>
                <th><b class="text-dark">Approved On</b></th>
              </tr>
            </thead>
            <tbody class="list invoices-list"></tbody>
          </table>
          <button class="btn btn-sm btn-primary" onclick="showWithdrawalTransactions('approved',-10)" style="float:center;margin-left: 45%; ">prev</button>
          <button class="btn btn-sm btn-primary" onclick="showWithdrawalTransactions('approved',0)" style="float:center; ">1</button>
          
          <button class="btn btn-sm btn-primary" onclick="showWithdrawalTransactions('approved',10)" style="float:center;">next</button>
        </div>
      </div>`;
      s6 = s6 + i;
      console.log("hi", s6);
      if (i == 0) {
        s6 = 0;
      } else if (s6 < 0) {
        s6 = 0;
      }
      fetch(
        `https://sideshnew-zenwin.herokuapp.com/admin/payment/withdrawalRequestList/user?limit=10&mobile=` +
          mobileNo +
          `&skip=` +
          s6 +
          `&status=approved`,
        {
          method: "GET",
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
          buildWithdrawalApproveTable(response);
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
    } else if (typeOfTransaction == "rejected") {
      profile.innerHTML = `
      <div id="myModal" class="modal">
    <span class="close"><button onclick="closeSS()">Close</button></span>
    <img class="ssZoom" id="img01">
    </div>
      <div class="card-header border-0">
    <div class="col-xl-12 mt-2">
        <ul class="nav nav-pills justify-content-start">
            <li class="nav-item mt-2">
                <a href="#" onclick="showWithdrawalTransactions('pending',0)" data-toggle="tab" class="btn nav-link py-2 px-3 ">
                    <span class="d-none d-md-block" id="fs">Pending Recharges (<span
                            id="orders_count"></span>)</span>
                    <span class="d-md-none">Pending Recharges</span>
                </a>
            </li>
            <li class="nav-item mt-2">
                <a href="#"  onclick="showWithdrawalTransactions('approved',0)" data-toggle="tab" class="btn nav-link py-2 px-3">
                    <span class="d-none d-md-block" id="sp">Approved Recharges</span>
                    <span class="d-md-none">Approved Recharges</span>
                </a>
            </li>
          <li class="nav-item mt-2">
                <a href="#" onclick="showWithdrawalTransactions('rejected',0)" data-toggle="tab" class="btn nav-link py-2 px-3 active">
                    <span class="d-none d-md-block">Rejected Recharges</span>
                    <span class="d-md-none">Rejected Recharges</span>
                </a>
            </li> 
        </ul>
    </div>
</div>
      <div class="col" id="order-completed-table">
      <div class="card table-flush">
        <div class="table-responsive">
          <table class="table align-items-center" id="invoice_table">
            <thead class="thead">
              <tr>
                <th><b class="text-dark">Transaction ID</b></th>
                <th><b class="text-dark">Recharge Amount</b></th>
                <th><b class="text-dark">Upi Id</b></th>
                <th><b class="text-dark">Rejected By</b></th>
                <th><b class="text-dark">Rejected Reason</b></th>
                <th><b class="text-dark">Rejected On</b></th>
              </tr>
            </thead>
            <tbody class="list invoices-list"></tbody>
          </table>
        </div>
        <div class="card-footer py-4">
        <button class="btn btn-sm btn-primary" onclick="showWithdrawalTransactions('rejected',-10)" style="float:center;margin-left: 45%; ">prev</button>
        <button class="btn btn-sm btn-primary" onclick="showWithdrawalTransactions('rejected',0)" style="float:center; ">1</button>
        
        <button class="btn btn-sm btn-primary" onclick="showWithdrawalTransactions('rejected',10)" style="float:center;">next</button>
        </div>
      </div>`;

      s2 = s2 + i;
      console.log("hi", s2);
      if (i == 0) {
        s2 = 0;
      } else if (s2 < 0) {
        s2 = 0;
      }
      fetch(
        `https://sideshnew-zenwin.herokuapp.com/admin/payment/withdrawalRequestList/user?mobile=` +
          mobileNo +
          `&limit=10&skip=` +
          s2 +
          `&status=rejected`,
        {
          method: "GET",
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
          buildWithdrawalRejectTable(response);
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
  }

  // showTransactions('pending')

  function buildRejectTable(tableData) {
    console.log(tableData);
    let tableBody = $(".invoices-list");
    tableBody.empty();
    const { pageCount, invoiceCount, pageNumber, invoices } = tableData;
    if (tableData.length == 0) {
      tableBody.html(
        '<h2 class="d-flex justify-content-center mt-3">No more orders Rejected</h2>'
      );
    } else {
      tableData.forEach((invoice) => {
        let tablerow = "";
        tablerow += `<tr>
          <th>${invoice._id}</th>
          <td><img onclick="abc(this.src)" src=${invoice.screenShotUrl} class="screenshot avatar rounded-circle" style="width:2rem; height:2rem;">
          <span class="form-control-label ml-2"><a style="cursor:pointer; color:#0341fc;" href="client_profile.html?customerId=${invoice.userId}">${invoice.userId}</span></td>
          <td>${invoice.amount}</td>
          <td>₹${invoice.amount}</td>
          <td>${invoice.approvedBy}</td>
          <td>${invoice.rejectedReason}</td>
          <td>${invoice.approvedOn}</td>
          </tr>`;
        tableBody.append(tablerow);
      });
      // reqData.currentPageNumber = pageNumber
      /* Display buttons */
      // getPageButtons(pageCount);
    }
  }

  function buildApproveTable(tableData) {
    console.log(tableData);
    let tableBody = $(".invoices-list");
    tableBody.empty();
    const { pageCount, invoiceCount, pageNumber, invoices } = tableData;
    if (tableData.length == 0) {
      tableBody.html(
        '<h2 class="d-flex justify-content-center mt-3">No more approved orders</h2>'
      );
    } else {
      tableData.forEach((invoice) => {
        let tablerow = "";
        tablerow += `<tr>
          <th>${invoice._id}</th>
          <td><img onclick="abc(this.src)" src=${invoice.screenShotUrl} class="screenshot avatar rounded-circle" style="width:2rem; height:2rem;">
          <span class="form-control-label ml-2"><a style="cursor:pointer; color:#0341fc;" href="client_profile.html?customerId=${invoice.userId}">${invoice.userId}</span></td>
          <td>${invoice.amount}</td>
          <td>₹${invoice.amount}</td>
          <td>${invoice.approvedBy}</td>
          <td>${invoice.approvedOn}</td>
          </tr>`;
        tableBody.append(tablerow);
      });
      // reqData.currentPageNumber = pageNumber
      /* Display buttons */
      // getPageButtons(pageCount);
    }
  }

  function buildInvoiceTable(tableData) {
    console.log(tableData);
    let tableBody = $(".invoices-list");
    tableBody.empty();
    const { pageCount, invoiceCount, pageNumber, invoices } = tableData;
    if (tableData.length == 0) {
      tableBody.html(
        '<h2 class="d-flex justify-content-center mt-3">No orders Pending</h2>'
      );
    } else {
      tableData.forEach((invoice) => {
        let tablerow = "";
        tablerow += `<tr>
          <th>${invoice._id}</th>
          <td><img onclick="abc(this.src)" src=${
            invoice.screenShotUrl
          } class="screenshot avatar rounded-circle" style="width:2rem; height:2rem;">
          <span class="form-control-label ml-2"><a style="cursor:pointer; color:#0341fc;" href="client_profile.html?customerId=${
            invoice.userId
          }">${invoice.userId}</span></td>
          <td>${invoice.amount}</td>
          <td>₹${invoice.amount}</td>
          <td><button id=${
            invoice._id
          } class=btn btn-primary onclick="approve('${
          invoice._id
        }')">Approve</button></td>
          <td><button id=${
            invoice._id + "1"
          } class=btn btn-primary onclick="reject('${invoice._id}','${
          invoice._id + "1"
        }','${invoice._id + "2"}')">Reject</button></td>
          <td><textarea id=${
            invoice._id + "2"
          } rows="3" cols="50"></textarea></td>
          </tr>`;
        tableBody.append(tablerow);
      });
      // reqData.currentPageNumber = pageNumber
      /* Display buttons */
      // getPageButtons(pageCount);
    }
  }

  function buildWithdrawalInvoiceTable(tableData) {
    console.log(tableData);
    let tableBody = $(".invoices-list");
    tableBody.empty();
    const { pageCount, invoiceCount, pageNumber, invoices } = tableData;
    if (tableData.length == 0) {
      tableBody.html(
        '<h2 class="d-flex justify-content-center mt-3">No orders Pending</h2>'
      );
    } else {
      tableData.forEach((invoice) => {
        let tablerow = "";
        tablerow += `<tr>
          <th>${invoice._id}</th>
          <td>₹${invoice.amount}</td>
          <td><button id=${
            invoice._id
          } class=btn btn-primary onclick="withdrawalApprove('${
          invoice._id
        }')">Approve</button></td>
          <td><button id=${
            invoice._id + "1"
          } class=btn btn-primary onclick="withdrawalreject('${invoice._id}','${
          invoice._id + "1"
        }','${invoice._id + "2"}')">Reject</button></td>
          <td><textarea id=${
            invoice._id + "2"
          } rows="3" cols="50"></textarea></td>
          </tr>`;
        tableBody.append(tablerow);
      });
      // reqData.currentPageNumber = pageNumber
      /* Display buttons */
      // getPageButtons(pageCount);
    }
  }

  function buildWithdrawalApproveTable(tableData) {
    console.log(tableData);
    let tableBody = $(".invoices-list");
    tableBody.empty();
    const { pageCount, invoiceCount, pageNumber, invoices } = tableData;
    if (tableData.length == 0) {
      tableBody.html(
        '<h2 class="d-flex justify-content-center mt-3">No more approved orders</h2>'
      );
    } else {
      tableData.forEach((invoice) => {
        let tablerow = "";
        tablerow += `<tr>
          <th>${invoice._id}</th>
          <td>₹${invoice.amount}</td>
          <td>${invoice.upiId}</td>
          <td>${invoice.approvedBy}</td>
          <td>${invoice.approvedOn}</td>
          </tr>`;
        tableBody.append(tablerow);
      });
      // reqData.currentPageNumber = pageNumber
      /* Display buttons */
      // getPageButtons(pageCount);
    }
  }

  function buildWithdrawalRejectTable(tableData) {
    console.log(tableData);
    let tableBody = $(".invoices-list");
    tableBody.empty();
    const { pageCount, invoiceCount, pageNumber, invoices } = tableData;
    if (tableData.length == 0) {
      tableBody.html(
        '<h2 class="d-flex justify-content-center mt-3">No more orders Rejected</h2>'
      );
    } else {
      tableData.forEach((invoice) => {
        let tablerow = "";
        tablerow += `<tr>
          <th>${invoice._id}</th>
          <td>₹${invoice.amount}</td>
          <td>${invoice.upiId}</td>
          <td>${invoice.approvedBy}</td>
          <td>${invoice.rejectedReason}</td>
          <td>${invoice.approvedOn}</td>
          </tr>`;
        tableBody.append(tablerow);
      });
      // reqData.currentPageNumber = pageNumber
      /* Display buttons */
      // getPageButtons(pageCount);
    }
  }

  function abc(url) {
    console.log(url);
    img01.src = url;
    myModal.style.display = "block";
  }
  function closeSS() {
    console.log("hello");
    myModal.style.display = "none";
  }

  function client_orders(parity, i) {
    var profile = document.getElementById("profile");
    showLoader();
    profile.innerHTML =
      `<div class="col" id="order-completed-table">
                        <div class="card table-flush">
                            <div class="table-responsive">
                                <table class="table align-items-center">
                                    <thead class="thead">
                                        <tr>
                                          <th><b class="text-primary">GAME ID</b></th>
                                          <th><b class="text-primary">USER ID</b></th>
                                          <th><b class="text-primary">AMOUNT BETTED</b></th>
                                          <th><b class="text-primary">WINNING AMOUNT</b></th>
                                          <th><b class="text-primary">BET TYPE</b></th>
                                          <th><b class="text-primary">COLOR/NUMBER BETTED ON</b></th>
                                          <th><b class="text-primary">WON</b></th>
                                          <th><b class="text-primary">ORDER CREATED AT</b></th>
                                          <th><b class="text-primary">ORDER UPDATED AT</b></th>
                                        </tr>
                                    </thead>
                                    <tbody class="list order-list"></tbody>
                                </table>
                                <button class="btn btn-sm btn-primary" onclick="client_orders(` +
      parity +
      `,-10)" style="float:center;margin-left: 45%; ">prev</button>
                                <button class="btn btn-sm btn-primary" onclick="client_orders(` +
      parity +
      `,0)" style="float:center; ">1</button>
                                
                                <button class="btn btn-sm btn-primary" onclick="client_orders(` +
      parity +
      `,10)" style="float:center;">next</button>
                            </div>
                            <div class="card-footer py-4">
                                <nav aria-label="...">
                                    <div class="pagination justify-content-center mb-0 page-buttons"></div>
                                </nav>
                            </div>
                        </div>
                    </div>
                        
    `;
    console.log(s);
    s = s + i;
    console.log(s);
    if (i == 0) {
      s = 0;
    } else if (s < 0) {
      s = 0;
    }
    fetch(
      `https://sideshnew-zenwin.herokuapp.com/admin/user/bets?userId=` +
        customer_id +
        `&skip=` +
        s +
        `&limit=10`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    )
      .then((response) => {
        console.log(response);
        const status = response.status;
        const responser = response.json();
        return {
          status,
          responser,
        };
      })
      .then((response) => {
        console.log("hello", response.status);

        if (response.status != 200) {
          swal({
            title: "Oops!",
            text: `${response.message}`,
            type: "error",
            icon: "error",
          });
          throw new Error("Please try again later");
        }
        return response.responser;
      })
      .then((response) => {
        console.log("I am here", response);
        /* function to render table */
        if (parity == 1) {
          buildorderTable(response, 1);
        } //Parity 1 for fast parity results
        else {
          buildorderTable(response, 0); //Parity 0 for slow parity results
        }
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

  function buildorderTable(tableData, n) {
    console.log(tableData);
    let tableBody = $(".order-list");
    tableBody.empty();

    const { slowParity, fastParity } = tableData;
    let typeOfParity = slowParity;
    let type = "sp";
    if (n == 1) {
      typeOfParity = fastParity;
      type = "fp";
    }
    if (typeOfParity.length == 0) {
      tableBody.html(
        '<h2 class="d-flex justify-content-center mt-3">No Any Data Available</h2>'
      );
    } else {
      typeOfParity.forEach((order) => {
        let tablerow = `
        <tr>
        <th><a  style="cursor:pointer; color:#0341fc;" href="order_details.html?gameId=${order.gameId}&parity=${type}">${order.gameId}</th>
        <td><a style="cursor:pointer; color:#0341fc;" href="client_profile.html?customerId=${order.userId}">${order.userId}</td>
        <td>₹${order.amountBetted}</td>
        <td>${order.winnigAmount}</td>
        <td>${order.betType}</td>
        <td>${order.colorBettedOn}</td>
        <td>${order.won}</td>
        <td>${order.createdAt}</td>
        <td>${order.updatedAt}</td>

        `;
        // var orderCurrentStatus = order.orderNotaryStatus;
        // if (orderCurrentStatus == 3 || orderCurrentStatus == 4) {
        //   orderCurrentStatus -= 1;
        // }
        // if (orderCurrentStatus >= 5) {
        //   orderCurrentStatus -= 2;
        // }
        // var order_status_data = {
        //   0: "Scheduled",
        //   1: "Assigned",
        //   2: "Confirmed",
        //   3: "In-Progress",
        //   4: "Completed",
        // };
        // var btn_color = {
        //   0: "primary",
        //   1: "primary",
        //   2: "warning",
        //   3: "info",
        //   4: "success",
        // };
        // tablerow += `<td><button class="btn btn-${btn_color[orderCurrentStatus]}" onclick="order_details_page('${order._id}')">${order_status_data[orderCurrentStatus]}</button></td>
        // </tr>`;
        tableBody.append(tablerow);
      });
      // reqData.currentPageNumber = pageNumber;
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
      appointments_scheduled(reqData);
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

  profile();
}

function deleteClient(clientId) {
  swal({
    title: "Are you sure?",
    text: `You want to Delete Customer`,
    icon: "warning",
    type: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      showLoader();
      fetch(`https://api.notarizetech.com/admin/customer/deleteCustomer`, {
        method: "POST",
        body: JSON.stringify({
          customerIdToDelete: clientId,
          confirmDelete999: "delete-customer",
          adminId: localStorage.getItem("adminId"),
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
              title: "Oops",
              text: `${response.message}`,
              type: "error",
              icon: "error",
            });
            hideLoader();
          }
          console.log(response);
          swal({
            title: "",
            text: `Customer Deleted Successfully`,
            type: "success",
            icon: "success",
          }).then(function () {
            window.location.href = "./clients.html";
          });
        })
        .catch((err) => {
          swal({
            title: "Oops",
            text: `Error in fetching Data ${err}`,
            type: "error",
            icon: "error",
          });
          hideLoader();
        });
    }
  });
}

function withdrawalApprove(id) {
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
function withdrawalReject(transactionId, rejectId, reasonId) {
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

function approve(id) {
  const obj = {
    transactionId: id,
    status: "approved",
  };
  console.log(JSON.stringify(obj));
  console.log("Entererd");
  console.log(id);
  fetch(`https://sideshnew-zenwin.herokuapp.com/admin/payment/recharge`, {
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
  fetch(`https://sideshnew-zenwin.herokuapp.com/admin/payment/recharge`, {
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

function editClient(clientId) {
  swal({
    title: "Are you sure?",
    text: `You want to Edit Customer`,
    icon: "warning",
    type: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      showLoader();
      var first_name = $("#input-first-name").val();
      var last_name = $("#input-last-name").val();
      var phone = $("#input-phone").val();
      var email = $("#input-email").val();
      // var address = $("#input-address").val();
      var companyname = $("#input-company").val();
      var postal = $("#input-postal-code").val();
      console.log(first_name, last_name, phone, email, companyname, postal);
      if (
        (first_name && first_name.trim() == "") ||
        (last_name && last_name.trim() == "") ||
        (phone && phone.trim() == "") ||
        (email && email.trim() == "") ||
        // (addresss && address.trim() == "") ||
        (companyname && companyname.trim() == "") ||
        (postal && postal.trim() == "")
      ) {
        swal({
          title: "Oops",
          text: "All fields Required",
          type: "error",
          icon: "error",
        }).then(() => hideLoader());
      } else {
        var data = JSON.stringify({
          customerId: clientId,
          firstName: first_name,
          lastName: last_name,
          phoneNumber: phone,
          email: email,
          // companyAddress: address,
          companyZipcode: postal,
          companyName: companyname,
          phoneCountryCode: "+1",
          mailingEqualsCompanyAddress: true,
          adminId: localStorage.getItem("adminId"),
        });

        fetch(
          `https://api.notarizetech.com/customer/updateProfile
        `,
          {
            method: "POST",
            body: data,
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
              });
              hideLoader();
            }
            console.log("edit Responce--", response);
            swal({
              title: "Nice",
              text: `Customer Edited Successfully`,
              type: "success",
              icon: "success",
            }).then(function () {
              window.location.href = `./client_profile.html?customerId=${clientId}&customerName=${first_name}${last_name}`;
            });
          })
          .catch((err) => {
            swal({
              title: "Oops",
              text: `Error in fetching Data ${err}`,
              type: "error",
              icon: "error",
            });
            hideLoader();
          });
      }
    }
  });
}
