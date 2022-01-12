// var notery_id = localStorage.getItem("notery_id")
var admin_id = localStorage.getItem("adminId")

const url = window.location.href
var new_url = new URL(url);
var notery_id = new_url.searchParams.get("notaryId")

var natary_professional_info, natary_personal_info
if (notery_id) {
  var settings = {
    "url": "https://api.notarizetech.com/admin/notary/getNotaryProfile",
    "method": "POST",
    "timeout": 0,
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")

    },
    "data": JSON.stringify({
      "notaryId": notery_id
    }),
  };
  $.ajax(settings).done(function (response) {
    console.log('responce--', response)
    natary_personal_info = response.notary
    natary_professional_info = response.professionalInfo
    personal_info()
    hideLoader()
  });

  function personal_info() {
    console.log("natary_personal_info--",natary_personal_info)
    var profile = document.getElementById('profile');
    var html = ""
    html = `
        <div class="card-body">
          <div class="card-header d-flex justify-content-center">
          <img alt="Image placeholder" src="${natary_personal_info.userImageURL}"
          class="avatar rounded-circle" style="width:6rem; height:6rem;"></img>
          </div>
          <form>
            <div class="pl-lg-4">
              <div class="row">
                <div class="col-lg-6">
                  <div class="form-group">
                    <label class="form-control-label" for="input-first-name">First name</label>
                    <input type="text" id="input-first-name" class="form-control" placeholder="First name" value="${natary_personal_info.firstName}" disabled>
                  </div>
                </div>
                <div class="col-lg-6">
                  <div class="form-group">
                    <label class="form-control-label" for="input-last-name">Last name</label>
                    <input type="text" id="input-last-name" class="form-control" placeholder="Last name" value="${natary_personal_info.lastName}" disabled>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-6">
                  <div class="form-group">
                    <label class="form-control-label" for="input-phone">Phone No.</label>
                    <input type="tel" id="input-phone" class="form-control" placeholder="Phone Number" value="${natary_personal_info.phoneNumber}" disabled>
                  </div>
                </div>
                <div class="col-lg-6">
                  <div class="form-group">
                    <label class="form-control-label" for="input-email">Email address</label>
                    <input type="email" id="input-email" class="form-control" value="${natary_personal_info.email}" disabled>
                  </div>
                </div>
              </div>
            </div>
            <div class="pl-lg-4">
            <div class="row">
                <div class="col-lg-12">
                    <div class="form-group row">
                     <div class="col-xl-2">
                        <b>Language Known</b>
                     </div>`
    for (let index = 0; index < natary_personal_info.knownLanguages.length; index++) {
      html += `
                        <div class="col-xl-2">
                          <i class="fas fa-check"></i>
                          <label class="form-control-label" for="input-last-name">${natary_personal_info.knownLanguages[index]}</label>
                          </div>`

    }

    html += `       
                    </div>
                </div>
                <div class="col-lg-12 my-4">
                      <b>Driver Licence</b>
                      <a href="${natary_personal_info.DLDocumentURL}" class="btn btn-primary text-white ml-5 btn-sm">View</a>
                </div>
              </div>
              <div class="row">
                
                <div class="col-lg-6">
                  <div class="form-group">
                    <label class="form-control-label" for="input-first-name">Driver Licence Number</label>
                    <input type="text" id="input-first-name" class="form-control" placeholder="First name" value="${natary_personal_info.DLNumber}" disabled>
                  </div>
                </div>
                <div class="col-lg-6">
                  <div class="form-group">
                    <label class="form-control-label" for="input-last-name">DL issue State</label>
                    <input type="text" id="input-last-name" class="form-control" placeholder="Last name" value="${natary_personal_info.DLIssueState}" disabled>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-6">
                  <div class="form-group">
                    <label class="form-control-label" for="input-username">Issue Date</label>
                    <input type="text" id="input-phone" class="form-control"  value="${getDate(natary_personal_info.DLIssueDate)}" disabled>
                  </div>
                </div>
                <div class="col-lg-6">
                  <div class="form-group">
                    <label class="form-control-label" for="input-email">Expiration Date</label>
                    <input type="text" id="input-email" class="form-control" value="${getDate(natary_personal_info.DLExpiryDate)}" disabled>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      
`
    profile.innerHTML = html
  }

  function professional_info() {

    var profile = document.getElementById('profile');
    var html = ""
    console.log("natary_professional_info--", natary_professional_info)
    if (natary_professional_info) {
      html += `
          <div class="card-body">
            <div class="card-header d-flex justify-content-center">
              <h2 class="text-dark text-lg">Professional Information</h2>
            </div>
            <form>
              <div class="pl-lg-4">
                <div class="row">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label">Commission ID</label>
                      <input type="text"  class="form-control" placeholder="ABDC123" value="${
                        natary_professional_info.commissionId
                      }" disabled>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label">Commission State Issue</label>
                      <input type="text" class="form-control" placeholder="" value="${
                        natary_professional_info.commissionIssueState
                      }" disabled>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label">Commission Issue Date</label>
                      <input type="text" class="form-control" value="${getDate(
                        natary_professional_info.commissionIssueDate
                      )}" disabled>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label">Commission Expiration Date</label>
                      <input type="text" class="form-control" placeholder="${getDate(
                        natary_professional_info.commissionExpiryDate
                      )}" disabled>
                    </div>
                  </div>
                </div>
              </div>
              <div class="pl-lg-4">
              <div class="card">
                  <div class="card-header">
                  <img
                            class="mx-4 bg-white"
                            alt="Image placeholder"
                            id="profile-picture-img"
                            style="height: 48px;"
                            src="../assets/img/icons/common/mark.jpeg"
                          />
                  
                        <b class="text-primary text-lg">Notary Uploads</b>
                  </div>
                  <div class="card-body row">`
                  if(natary_professional_info.commissionDocumentURL || natary_professional_info.NNADocumentURL || natary_professional_info.LSSDocumentURL || natary_professional_info.notaryBondDocumentURL)
                    {
                      if(natary_professional_info.commissionDocumentURL != undefined){
                        html+=`<div class="col-lg-12 mt-4 row">
                          <div class="col-xl-4">
                              <b>NotaryCommission Certificate</b>
                          </div>
                          
                          <div class="col-xl-4">
                              <a class="btn btn-primary text-white  btn-sm" href="${
                                natary_professional_info.commissionDocumentURL
                              }" target="_blank">View File</a>
                          </div>
                      </div>`
                    }
                    if(natary_professional_info.NNADocumentURL != undefined){
                      html+=`<div class="col-lg-12 mt-4 row">
                          <div class="col-xl-4">
                              <b>NNA Certificate</b>
                          </div>
                          
                          <div class="col-xl-4">
                              <a class="btn btn-primary text-white  btn-sm" href="${
                                natary_professional_info.NNADocumentURL
                              }" target="_blank">View File</a>
                          </div>
                      </div>`}
                      if(natary_professional_info.LSSDocumentURL != undefined){
                      html+= `<div class="col-lg-12 mt-4 row">
                          <div class="col-xl-4">
                              <b>LSS Certificate</b>
                          </div>
                          
                          <div class="col-xl-4">
                              <a class="btn btn-primary text-white  btn-sm" href="${
                                natary_professional_info.LSSDocumentURL
                              }" target="_blank">View File</a>
                          </div>
                      </div>`}
                      if(natary_professional_info.notaryBondDocumentURL != undefined){
                      html += `<div class="col-lg-12 mt-4 row">
                          <div class="col-xl-4">
                              <b>Notary Bond</b>
                          </div>
                          
                          <div class="col-xl-4">
                              <a class="btn btn-primary text-white  btn-sm"  href="${
                                natary_professional_info.notaryBondDocumentURL
                              }" target="_blank">View File</a>
                          </div>
                      </div>`}
                    }
                    else{
                      html +=`<div class="col-xl-12">
                                  <h2 class="text-dark text-lg">No Document Uploaded by Notary</h2>
                              </div>`
                    }
                  html +=`</div>
                </div>
                <div class="row mt-5">
                  <div class="col-xl-12 d-flex justify-content-center">
                    <h2 class="text-dark text-lg">Errors & Omission Insurance Details</h2>
                  </div>
                  <div class="col-lg-6 mt-5">
                    <div class="form-group">
                      <label class="form-control-label" for="input-first-name">Name of Insured Person</label>
                      <input type="text" id="input-first-name" class="form-control" placeholder="First name" value="${
                        natary_professional_info.insuredPersonFullName
                      }" disabled>
                    </div>
                  </div>
                  <div class="col-lg-6 mt-5">
                    <div class="form-group">
                      <label class="form-control-label" for="input-last-name">Name of Persons Covered</label>
                      <input type="text" id="input-last-name" class="form-control" placeholder="Last name" value="${
                        natary_professional_info.coveredPersonName
                      }" disabled>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label" for="input-username">Policy Number</label>
                      <input type="text" id="input-phone" class="form-control" placeholder="Phone Number" value="${
                        natary_professional_info.insurancePolicyNumber
                      }" disabled>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label" for="input-email">Expiry Date</label>
                      <input type="text" id="input-email" class="form-control" value="${getDate(
                        natary_professional_info.insuranceExpiryDate
                      )}" disabled>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label" for="input-username">Per Claim Limit</label>
                      <input type="text" id="input-phone" class="form-control" placeholder="Phone Number" value="${
                        natary_professional_info.insurancePerClaimLimit
                      }" disabled>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label" for="input-email">Aggregrate Limit</label>
                      <input type="text" id="input-email" class="form-control" value="${
                        natary_professional_info.insuranceAggregateLimit
                      }" disabled>
                    </div>
                  </div>
                </div>
                <div class="card mt-5">
                  <div class="card-header">
                    <h2>Notary Equipments</h2>
                  </div>
                  <div class="card-body row">
                    <div class="col-xl-12 row my-2">
                        <div class="col-xl-4"><b>Do you have mobile printing capablities?</b></div>
                        <div class="col-xl-1"><input type="radio"` 
                        if(natary_professional_info.mPrinter){
                          html += `checked`
                        }
                        else{
                          html += `disabled`
                        }
                        html+=`><lable class="ml-1">Yes</lable></div>
                        <div class="col-xl-1"><input type="radio"
                        ` 
                        if(!natary_professional_info.mPrinter){
                          html += `checked`
                        }
                        else{
                          html += `disabled`
                        }
                        html+=`
                        ><lable class="ml-1">No</lable></div>
                    </div>
                    <div class="col-xl-12 row my-2">
                        <div class="col-xl-4"><b>Do you have mobile scanning capablities?</b></div>
                        <div class="col-xl-1"><input type="radio"` 
                        if(natary_professional_info.mScanner){
                          html += `checked`
                        }
                        else{
                          html += `disabled`
                        }
                        html+=`><lable class="ml-1">Yes</lable></div>
                        <div class="col-xl-1"><input type="radio"` 
                        if(!natary_professional_info.mScanner){
                          html += `checked`
                        }
                        else{
                          html += `disabled`
                        }
                        html+=`><lable class="ml-1">No</lable></div>
                    </div>
                    <div class="col-xl-12 row my-2 ">
                        <div class="col-xl-4"><b>Do you have mobile a hotspot?</b></div>
                        <div class="col-xl-1"><input type="radio"` 
                        if(natary_professional_info.hotspot){
                          html += `checked`
                        }
                        else{
                          html += `disabled`
                        }
                        html+=`><lable class="ml-1">Yes</lable></div>
                        <div class="col-xl-1"><input type="radio"` 
                        if(!natary_professional_info.hotspot){
                          html += `checked`
                        }
                        else{
                          html += `disabled`
                        }
                        html+=`><lable class="ml-1">No</lable></div>
                    </div>
                    <div class="col-xl-12 row my-2 ">
                        <div class="col-xl-4"><b>Do you have a dual tray printer?</b></div>
                        <div class="col-xl-1"><input type="radio"` 
                        if(natary_professional_info.dltPrinter){
                          html += `checked`
                        }
                        else{
                          html += `disabled`
                        }
                        html+=`><lable class="ml-1">Yes</lable></div>
                        <div class="col-xl-1"><input type="radio"` 
                        if(!natary_professional_info.dltPrinter){
                          html += `checked`
                        }
                        else{
                          html += `disabled`
                        }
                        html+=`><lable class="ml-1">No</lable></div>
                    </div>
                    <div class="col-xl-12 row my-2 ">
                        <div class="col-xl-4"><b>Do you have a multi page scanner?</b></div>
                        <div class="col-xl-1"><input type="radio"` 
                        if(natary_professional_info.mtpScanner){
                          html += `checked`
                        }
                        else{
                          html += `disabled`
                        }
                        html+=`><lable class="ml-1">Yes</lable></div>
                        <div class="col-xl-1"><input type="radio"` 
                        if(!natary_professional_info.mtpScanner){
                          html += `checked`
                        }
                        else{
                          html += `disabled`
                        }
                        html+=`><lable class="ml-1">No</lable></div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        
  `;
      profile.innerHTML = html
    } else {
      profile.innerHTML = "Professional Info not available"
    }
  }

  function approve_notery() {
    document.getElementById("app_btn").innerHTML = `<span class="mini-loader mx-3"></span><span class="mx-auto">Approve</span>`
    showMiniLoader()
    // console.log("function notery_id--", notery_id)
    fetch(`https://api.notarizetech.com/admin/notary/approveNotary`, {
        method: "POST",
        body: JSON.stringify({
          "notaryId": notery_id,
          "adminId": admin_id
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
        console.log(response);
        if (!response.status) {
          swal({
            title: "Oops",
            text: `${response.message}`,
            type: "danger"
          }).then(function () {
            hideLoader()
          })
        }
        console.log(response);
        swal({
          title: "Great",
          text: "NotaryApproved Successfully",
          type: "success",
          icon: "success"
        }).then(function () {
          window.location.href = "notery_list.html"
        });

        /* function to render table */
      })
      .catch((err) => {
        swal({
          title: "Oops",
          text: `Error in fetching Data Refresh Page`,
          type: "error",
          icon: "error"
        }).then(()=>window.location.reload())
      })

  }


  function reject_notery() {
    document.getElementById("rej_btn").innerHTML = `<span class="mini-loader mx-3"></span><span class="mx-auto">Reject</span>`
    showMiniLoader()
    fetch(`https://api.notarizetech.com/admin/notary/revokeNotary`, {
        method: "POST",
        body: JSON.stringify({
          "notaryId": notery_id,
          "adminId": admin_id
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
        console.log(response);
        if (!response.status) {
          swal({
            title: "Oops",
            text: `${response.message}`,
            type: "error",
            icon: "error"
          }).then(function () {
            hideLoader()
          })
        }
        swal({
          title: "",
          text: "NotaryApproval Rejected",
          type: "success",
          icon: "success"
        }).then(function () {
          window.location.href = "notery_list.html"
        });

      })
      .catch((err) => {
        swal({
          title: "Oops",
          text: `Error in fetching Data Refresh Page`,
          type: "error",
          icon: "error"
        }).then(()=>window.location.reload())
      })
  }
} else {
  window.location.href = "index.html"
}