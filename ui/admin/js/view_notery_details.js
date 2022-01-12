// var notery_id = localStorage.getItem("notery_id");
const url = window.location.href
var new_url = new URL(url);
var notery_id = new_url.searchParams.get("notaryId")

let reqData = {
  currentPageNumber: 0,
};
var natary_professional_info, natary_personal_info, notery_text_notes

if (notery_id) {
  var settings = {
    url: "https://api.notarizetech.com/admin/notary/getNotaryProfile",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: JSON.stringify({
      notaryId: notery_id,
    }),
  };
  $.ajax(settings).done(function (response) {
    console.log('responce--', response)
    natary_personal_info = response.notary
    natary_professional_info = response.professionalInfo
    notery_text_notes = response.notary.notes
    personal_info()
    hideLoader()
  });

  function personal_info() {
    console.log("natary_personal_info--", natary_personal_info)
    var profile = document.getElementById("profile");
    var html = "";

    var avail = document.getElementById("isAvailable");
    var enable = document.getElementById("isEnabled");
    document.getElementById("delete_notary").setAttribute("onclick", `deleteNotary('${natary_personal_info._id}')`)
    if (natary_personal_info.isAvailable) {
      avail.classList.add("btn-success");
      avail.innerText = "Available";
    } else {
      avail.classList.add("btn-danger");
      avail.innerText = "Unavailable";
    }
    if (natary_personal_info.isEnabled) {
      enable.classList.add("btn-danger");
      enable.setAttribute(
        "onclick",
        `isEnabled_notary('${natary_personal_info._id}','${natary_personal_info.isEnabled}')`
      );
      enable.innerHTML = `<span class="mini-loader mx-3"></span>Disable`;
    } else {
      enable.classList.add("btn-success");
      enable.setAttribute(
        "onclick",
        `isEnabled_notary('${natary_personal_info._id}','${natary_personal_info.isEnabled}')`
      );
      enable.innerHTML = `<span class="mini-loader mx-3"></span>Enable`;
    }

    html = `
            <div class="card-body">
              <div class="card-header d-flex justify-content-center">
              <a href="${natary_personal_info.notaryContractDocumentURL}" target="_blank"><img alt="Image placeholder" src="${natary_personal_info.userImageURL}"
              class="avatar rounded-circle" style="width:6rem; height:6rem;"></img></a>
              </div>
                <div class="pl-lg-4">
                  <div class="row">
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="form-control-label" for="input-first-name">First name</label>
                        <input type="text" id="input-first-name" class="form-control font-weight-bold" placeholder="First name" value="${natary_personal_info.firstName}">
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="form-control-label" for="input-last-name">Last name</label>
                        <input type="text" id="input-last-name" class="form-control font-weight-bold" placeholder="Last name" value="${natary_personal_info.lastName}">
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="form-control-label" for="input-phone">Phone No.</label>
                        <input type="tel" id="input-phone" class="form-control font-weight-bold" placeholder="Phone Number" value="${natary_personal_info.phoneNumber}">
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="form-control-label" for="input-email">Email address</label>
                        <input type="email" id="input-email" class="form-control font-weight-bold" value="${natary_personal_info.email}">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="pl-lg-4">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="form-group">
                          <label class="form-control-label" for="language-known">Language Known</label>
                          <input type="email" id="language-known" class="form-control font-weight-bold" value="${natary_personal_info.knownLanguages}">
                        </div>
                    </div>
                    <div class="col-xl-12 card">
                      <div class="card-header">
                      <img
                                class="avatar avatar-lg mx-4 bg-white"
                                alt="Image placeholder"
                                id="profile-picture-img"
                                src="../assets/img/icons/common/mark.jpeg"
                              />
                      
                            <b class="text-primary text-lg">Notary Uploads</b>
                      </div>
                      <div class="card-body row">
                        <div class="col-lg-6 my-4 row">
                          <b>Driver Licence</b>
                            <div class="col-xl-2">
                              <a href="${
                                  natary_personal_info.DLDocumentURL
                                }" class="btn btn-primary text-white  btn-sm" target="_blank">View</a>
                            </div>
                            <div class="col-xl-6">
                              <input type="file" class="btn btn-primary btn-sm form-control-file" onchange="myUploader('driver-docs')" id="driver-docs">
                              <input type="text" id="driver-docs-hidden" hidden>
                            </div>
                        </div>
                        <div class="col-lg-6 my-4 row">
                            <b>Contract Document</b>
                            <div class="col-xl-2">
                                <a href="${
                                  natary_personal_info.notaryContractDocumentURL
                                }" class="btn btn-primary text-white  btn-sm" target="_blank">View</a>
                            </div>
                            <div class="col-xl-6">
                              <input type="file" class="btn btn-primary btn-sm form-control-file" id="contract-docs" onchange="myUploader('contract-docs')">
                              <input type="text" id="contract-docs-hidden" hidden>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="form-control-label" for="dl-number">Driver Licence Number</label>
                        <input type="text" id="dl-number" class="form-control font-weight-bold" placeholder="First name" value="${
                          natary_personal_info.DLNumber
                        }" >
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="form-control-label" for="dl-issue-state">DL issue State</label>
                        <input type="text" id="dl-issue-state" class="form-control font-weight-bold" placeholder="Last name" value="${
                          natary_personal_info.DLIssueState
                        }">
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="form-control-label" for="dl-issue-date">Issue Date</label>
                        <input type="date" id="dl-issue-date" class="form-control font-weight-bold"  value="${
                          natary_personal_info.DLIssueDate.slice(0,10)
                        }">
                      </div>
                    </div>
                    <div class="col-lg-6">
                      <div class="form-group">
                        <label class="form-control-label" for="dl-exp-date">Expiration Date</label>
                        <input type="date" id="dl-exp-date" class="form-control font-weight-bold" value="${
                          natary_personal_info.DLExpiryDate.slice(0,10)
                        }">
                      </div>
                    </div>
                    
                    <div class="col-lg-12 d-flex justify-content-center">
                      <button type="button" class="btn btn-primary" onclick="editNotaryPersonalInfo('${natary_personal_info._id}')" ><i class="fas fa-pencil-alt mx-2"></i>Edit Notary</button>
                    </div>
                  </div>
                </div>
            </div>
    `;
    profile.innerHTML = html;

  }


  function professional_info() {
    var profile = document.getElementById("profile");
    var html = "";
    console.log("natary_professional_info--", natary_professional_info)
    if (natary_professional_info != null) {
      html += `
      <div class="card-body">
        <div class="card-header d-flex justify-content-center">
          <h2 class="text-dark text-lg">Professional Information</h2>
        </div>
          <div class="pl-lg-4">
            <div class="row">
              <div class="col-lg-6">
                <div class="form-group">
                  <label class="form-control-label">Commission ID</label>
                  <input type="text"  class="form-control" id="input-cms-id" placeholder="ABDC123" value="${
                    natary_professional_info.commissionId
                  }">
                </div>
              </div>
              <div class="col-lg-6">
                <div class="form-group">
                  <label class="form-control-label">Commission State Issue</label>
                  <input type="text" class="form-control" id="input-cms-state" placeholder="" value="${
                    natary_professional_info.commissionIssueState
                  }">
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <div class="form-group">
                  <label class="form-control-label">Commission Issue Date</label>
                  <input type="date" class="form-control" id="input-cms-date" value="${
                    natary_professional_info.commissionIssueDate.slice(0,10)
                  }">
                </div>
              </div>
              <div class="col-lg-6">
                <div class="form-group">
                  <label class="form-control-label">Commission Expiration Date</label>
                  <input type="date" class="form-control" id="input-cms-exp-date" value="${
                    natary_professional_info.commissionExpiryDate.slice(0,10)
                  }">
                </div>
              </div>
            </div>
          </div>
          <div class="pl-lg-4">
          <div class="card">
              <div class="card-header">
              <img
                        class="avatar avatar-lg mx-4 bg-white"
                        alt="Image placeholder"
                        id="profile-picture-img"
                        src="../assets/img/icons/common/mark.jpeg"
                      />
              
                    <b class="text-primary text-lg">Notary Uploads</b>
              </div>
              <div class="card-body row">
              <div class="col-lg-12 mt-4 row">
                            <div class="col-xl-4">
                                <b>NotaryCommission Certificate</b>
                            </div>
                            <div class="col-xl-6 row ">
                              <div class="col-xl-3">
                                <a class="btn btn-primary text-white  btn-sm" href="${
                                          natary_professional_info.commissionDocumentURL
                                        }" target="_blank">View File</a>
                              </div>
                              <div class="col-xl-6">
                                <input type="file" onchange="myUploader('comission-certificate')" class="btn btn-primary btn-sm form-control-file" id="comission-certificate">
                                <input type="text" id="comission-certificate-hidden" hidden>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-12 mt-4 row">
                          <div class="col-xl-4">
                              <b>NNA Certificate</b>
                          </div>
                          <div class="col-xl-6 row ">
                            <div class="col-xl-3">
                              <a class="btn btn-primary text-white  btn-sm" href="${
                                        natary_professional_info.NNADocumentURL
                                      }" target="_blank">View File</a>
                            </div>
                            <div class="col-xl-6">
                              <input type="file" onchange="myUploader('nna-certificate')" class="btn btn-primary btn-sm form-control-file" id="nna-certificate">
                              <input type="text" id="nna-certificate-hidden" hidden>
                            </div>
                          </div>
                      </div>
                      <div class="col-lg-12 mt-4 row">
                              <div class="col-xl-4">
                                  <b>LSS Certificate</b>
                              </div>
                              <div class="col-xl-6 row ">
                                <div class="col-xl-3">
                                <a class="btn btn-primary text-white  btn-sm" href="${
                                  natary_professional_info.LSSDocumentURL
                                }" target="_blank">View File</a>
                                </div>
                                <div class="col-xl-6">
                                    <input type="file" onchange="myUploader('lls-certificate')" class="btn btn-primary btn-sm form-control-file" id="lls-certificate">
                                    <input type="text" id="lls-certificate-hidden" hidden>
                                </div>
                              </div>
                          </div>
                         <div class="col-lg-12 mt-4 row">
                              <div class="col-xl-4">
                                  <b>Notary Bond</b>
                              </div>
                              
                              <div class="col-xl-6 row ">
                                <div class="col-xl-3">
                                  <a class="btn btn-primary text-white  btn-sm"  href="${
                                    natary_professional_info.notaryBondDocumentURL
                                  }" target="_blank">View File</a>
                                </div>
                                <div class="col-xl-6">
                                  <input type="file" onchange="myUploader('notary-bond')" class="btn btn-primary btn-sm form-control-file" id="notary-bond">
                                  <input type="text" id="notary-bond-hidden" hidden>
                                </div>
                              </div>
                          </div>
                          </div>
            </div>
            <div class="row mt-5">
              <div class="col-xl-12 d-flex justify-content-center">
                <h2 class="text-dark text-lg">Errors & Omission Insurance Details</h2>
              </div>
              <div class="col-lg-6 mt-5">
                <div class="form-group">
                  <label class="form-control-label" for="input-InsFull-name">Name of Insured Person</label>
                  <input type="text" id="input-inspFull-name" class="form-control" placeholder="First name" value="${
                    natary_professional_info.insuredPersonFullName
                  }">
                </div>
              </div>
              <div class="col-lg-6 mt-5">
                <div class="form-group">
                  <label class="form-control-label" for="input-covFull-name">Name of Persons Covered</label>
                  <input type="text" id="input-covFull-name" class="form-control" placeholder="Last name" value="${
                    natary_professional_info.coveredPersonName
                  }">
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <div class="form-group">
                  <label class="form-control-label" for="ins-policy-number">Policy Number</label>
                  <input type="text" id="ins-policy-number" class="form-control" placeholder="Phone Number" value="${
                    natary_professional_info.insurancePolicyNumber
                  }">
                </div>
              </div>
              <div class="col-lg-6">
                <div class="form-group">
                  <label class="form-control-label" for="ins-exp-date">Expiry Date</label>
                  <input type="date" id="ins-exp-date" class="form-control" value="${
                    natary_professional_info.insuranceExpiryDate.slice(0,10)
                  }">
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-lg-6">
                <div class="form-group">
                  <label class="form-control-label" for="ins-claim-limit">Per Claim Limit</label>
                  <input type="text" id="ins-claim-limit" class="form-control" placeholder="Phone Number" value="${
                    natary_professional_info.insurancePerClaimLimit
                  }">
                </div>
              </div>
              <div class="col-lg-6">
                <div class="form-group">
                  <label class="form-control-label" for="ins-agt-limit">Aggregrate Limit</label>
                  <input type="text" id="ins-agt-limit" class="form-control" value="${
                    natary_professional_info.insuranceAggregateLimit
                  }">
                </div>
              </div>
            </div>
            <div class="card mt-5">
              <div class="card-header">
                <h2 class="text-dark text-lg">Notary Equipments</h2>
              </div>
              <div class="card-body row">
                <div class="col-xl-12 row my-2">
                    <div class="col-xl-4"><b>Do you have mobile printing capablities?</b></div>
                    <div class="col-xl-1"><input type="radio" name="input-mPrinter" value="Yes"`
      if (natary_professional_info.mPrinter) {
        html += `checked`
      }
      html += `><lable class="ml-1">Yes</lable></div>
                                  <div class="col-xl-1"><input type="radio" name="input-mPrinter" value="No"
                                  `
      if (!natary_professional_info.mPrinter) {
        html += `checked`
      }
      html += `
                                  ><lable class="ml-1">No</lable></div>
                              </div>
                              <div class="col-xl-12 row my-2">
                                  <div class="col-xl-4"><b>Do you have mobile scanning capablities?</b></div>
                                  <div class="col-xl-1"><input type="radio" name="input-mScanner" value="Yes"`
      if (natary_professional_info.mScanner) {
        html += `checked`
      }
      html += `><lable class="ml-1">Yes</lable></div>
                                  <div class="col-xl-1"><input type="radio" name="input-mScanner" value="No"`
      if (!natary_professional_info.mScanner) {
        html += `checked`
      }
      html += `><lable class="ml-1">No</lable></div>
                              </div>
                              <div class="col-xl-12 row my-2 ">
                                  <div class="col-xl-4"><b>Do you have mobile a hotspot?</b></div>
                                  <div class="col-xl-1"><input type="radio" name="input-hotspot" value="Yes"`
      if (natary_professional_info.hotspot) {
        html += `checked`
      }
      html += `><lable class="ml-1">Yes</lable></div>
                                  <div class="col-xl-1"><input type="radio" name="input-hotspot" value="No"`
      if (!natary_professional_info.hotspot) {
        html += `checked`
      }
      html += `><lable class="ml-1">No</lable></div>
                              </div>
                              <div class="col-xl-12 row my-2 ">
                                  <div class="col-xl-4"><b>Do you have a dual tray printer?</b></div>
                                  <div class="col-xl-1"><input type="radio" name="input-dltPrinter" value="Yes"`
      if (natary_professional_info.dltPrinter) {
        html += `checked`
      }
      html += `><lable class="ml-1">Yes</lable></div>
                                  <div class="col-xl-1"><input type="radio" name="input-dltPrinter" value="No"`
      if (!natary_professional_info.dltPrinter) {
        html += `checked`
      }
      html += `><lable class="ml-1">No</lable></div>
                              </div>
                              <div class="col-xl-12 row my-2 ">
                                  <div class="col-xl-4"><b>Do you have a multi page scanner?</b></div>
                                  <div class="col-xl-1"><input type="radio" name="input-mtpScanner" value="Yes"`
      if (natary_professional_info.mtpScanner) {
        html += `checked`
      }
      html += `><lable class="ml-1">Yes</lable></div>
                                  <div class="col-xl-1"><input type="radio" name="input-mtpScanner" value="No"`
      if (!natary_professional_info.mtpScanner) {
        html += `checked`
      }
      html += `><lable class="ml-1">No</lable></div>
                              </div>
                            </div>
                          </div>
                          <div class="col-lg-12 d-flex justify-content-center">
                            <button type="button" class="btn btn-primary" onclick="editNotaryProfessionalInfo('${natary_personal_info._id}')" ><i class="fas fa-pencil-alt mx-2"></i>Edit Notary</button>
                          </div>
                        </div>
      </div>
`;
    } else {
      html += `
          <div class="card-body">
            <div class="card-header d-flex justify-content-center">
              <h2 class="text-dark text-lg">Upload Professional Information</h2>
            </div>
              <div class="pl-lg-4">
                <div class="row">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label">Commission ID</label>
                      <input type="text"  class="form-control" placeholder="ABDC123" value="">
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label">Commission State Issue</label>
                      <input type="text" class="form-control" placeholder="" value="">
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label">Commission Issue Date</label>
                      <input type="text" class="form-control" value="">
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label">Commission Expiration Date</label>
                      <input type="text" class="form-control" placeholder="">
                    </div>
                  </div>
                </div>
              </div>
              <div class="pl-lg-4">
                <div class="card">
                  <div class="card-header">
                    <img
                              class="avatar avatar-lg mx-4 bg-white"
                              alt="Image placeholder"
                              id="profile-picture-img"
                              src="../assets/img/icons/common/mark.jpeg"
                            />
                    
                    <b class="text-primary text-lg">Notary Uploads</b>
                  </div>
                  <div class="card-body row">
                    <div class="col-lg-12 mt-4 row">
                      <div class="col-xl-4">
                        <b>NotaryCommission Certificate</b>
                      </div>
                      <div class="col-xl-6 row ">
                        <div class="col-xl-6">
                          <input type="file" class="btn btn-primary btn-sm form-control-file" id="comission-certificate">
                        </div>
                      </div>
                    </div>
                    <div class="col-lg-12 mt-4 row">
                      <div class="col-xl-4">
                        <b>NNA Certificate</b>
                      </div>
                      <div class="col-xl-6 row ">
                        <div class="col-xl-6">
                          <input type="file" class="btn btn-primary btn-sm form-control-file" id="nna-certificate">
                        </div>
                      </div>
                    </div>
                    <div class="col-lg-12 mt-4 row">
                      <div class="col-xl-4">
                        <b>LSS Certificate</b>
                      </div>
                      <div class="col-xl-6 row ">
                        <div class="col-xl-6">
                          <input type="file" class="btn btn-primary btn-sm form-control-file" id="lls-certificate">
                        </div>
                      </div>
                    </div>
                    <div class="col-lg-12 mt-4 row">
                      <div class="col-xl-4">
                        <b>Notary Bond</b>
                      </div>
                      <div class="col-xl-6 row ">
                        <div class="col-xl-6">
                          <input type="file" class="btn btn-primary btn-sm form-control-file" id="notary-bond">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row mt-5">
                  <div class="col-xl-12 d-flex justify-content-center">
                    <h2 class="text-dark text-lg">Errors & Omission Insurance Details</h2>
                  </div>
                  <div class="col-lg-6 mt-5">
                    <div class="form-group">
                      <label class="form-control-label" for="input-InsFull-name">Name of Insured Person</label>
                      <input type="text" id="input-full-name" class="form-control" placeholder="First name" value="">
                    </div>
                  </div>
                  <div class="col-lg-6 mt-5">
                    <div class="form-group">
                      <label class="form-control-label" for="input-covFull-name">Name of Persons Covered</label>
                      <input type="text" id="input-covFull-name" class="form-control" placeholder="Last name" value="">
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label" for="ins-policy-number">Policy Number</label>
                      <input type="text" id="ins-policy-number" class="form-control" placeholder="Phone Number" value="">
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label" for="ins-exp-date">Expiry Date</label>
                      <input type="text" id="ins-exp-date" class="form-control" value="">
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label" for="ins-claim-limit">Per Claim Limit</label>
                      <input type="text" id="ins-claim-limit" class="form-control" placeholder="Phone Number" value="">
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="form-group">
                      <label class="form-control-label" for="ins-agt-limit">Aggregrate Limit</label>
                      <input type="text" id="ins-agt-limit" class="form-control" value="">
                    </div>
                  </div>
                </div>
                <div class="card mt-5">
                  <div class="card-header">
                    <h2 class="text-dark text-lg">Notary Equipments</h2>
                  </div>
                  <div class="card-body row">
                    <div class="col-xl-12 row my-2">
                        <div class="col-xl-4"><b>Do you have mobile printing capablities?</b></div>
                        <div class="col-xl-1"><input type="radio"><lable class="ml-1">Yes</lable></div>
                        <div class="col-xl-1"><input type="radio"><lable class="ml-1">No</lable></div>
                    </div>
                    <div class="col-xl-12 row my-2">
                        <div class="col-xl-4"><b>Do you have mobile scanning capablities?</b></div>
                        <div class="col-xl-1"><input type="radio"><lable class="ml-1">Yes</lable></div>
                        <div class="col-xl-1"><input type="radio"><lable class="ml-1">No</lable></div>
                    </div>
                    <div class="col-xl-12 row my-2 ">
                        <div class="col-xl-4"><b>Do you have mobile a hotspot?</b></div>
                        <div class="col-xl-1"><input type="radio"><lable class="ml-1">Yes</lable></div>
                        <div class="col-xl-1"><input type="radio"><lable class="ml-1">No</lable></div>
                    </div>
                    <div class="col-xl-12 row my-2 ">
                        <div class="col-xl-4"><b>Do you have a dual tray printer?</b></div>
                        <div class="col-xl-1"><input type="radio"><lable class="ml-1">Yes</lable></div>
                        <div class="col-xl-1"><input type="radio"><lable class="ml-1">No</lable></div>
                    </div>
                    <div class="col-xl-12 row my-2 ">
                        <div class="col-xl-4"><b>Do you have a multi page scanner?</b></div>
                        <div class="col-xl-1"><input type="radio"><lable class="ml-1">Yes</lable></div>
                        <div class="col-xl-1"><input type="radio"><lable class="ml-1">No</lable></div>
                    </div>
                  </div>
                </div>
                <div class="col-lg-12 d-flex justify-content-center">
                  <button type="button" class="btn btn-primary" onclick="editNotaryProfessionalInfo('${natary_personal_info._id}')" ><i class="fas fa-pencil-alt mx-2"></i>Edit Notary</button>
                </div>
              </div>
          </div>
        
  `;
    }

    profile.innerHTML = html;

  }

  function notery_orders() {
    var profile = document.getElementById("profile");
    showLoader();
    profile.innerHTML = `<div class="card table-flush">
                      <div class="table-responsive">
                          <table class="table align-items-center">
                              <thead class="thead">
                                  <tr>
                                    <th><b class="text-primary">Dcket No</b></th>
                                    <th><b class="text-primary">Order Title</b></th>
                                    <th><b class="text-primary">Amount</b></th>
                                    <th><b class="text-primary">Appointment Date & Time</b></th>
                                    <th><b class="text-primary">Status</b></th>
                                  </tr>
                              </thead>
                              <tbody class="list notery-orders"></tbody>
                          </table>
                      </div>
                      <div class="card-footer py-4">
                          <nav aria-label="...">
                              <div class="pagination justify-content-center mb-0 page-buttons"></div>
                          </nav>
                      </div>
                    </div>`;
    fetch(`https://api.notarizetech.com/admin/notary/getNotaryOrders`, {
        method: "POST",
        body: JSON.stringify({
          pageNumber: reqData.currentPageNumber,
          notaryId: notery_id,
        }),
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((response) => {
        if (!response.status) {
          swal({
            title: "Oops",
            text: `${response.message}`,
            type: "error",
            icn: "error",
          });
        }
        console.log(response);
        /* function to render table */
        buildnoteryTable(response);
        hideLoader();
      })
      .catch((err) => {
        swal({
          title: "Oops",
          text: `Error in fetching Data ${err}`,
          type: "error",
          icn: "error",
        });
        // console.log(`error ${err}`);
      });
  }
}

function buildnoteryTable(tableData) {
  console.log(tableData);
  let tableBody = $(".notery-orders");
  tableBody.empty();
  const {
    pageCount,
    orderCount,
    pageNumber,
    orders
  } = tableData;
  if (orders.length == 0) {
    tableBody.html(
      '<h2 class="d-flex justify-content-center mt-3">No Any Data Available</h2>'
    );
  } else {
    orders.forEach((order) => {
      let tablerow = `
      <tr>
      <th><a style="cursor:pointer; color:#0341fc;" href="order_details.html?orderId=${order._id}&ecscrow=${order.appointment.escrowNumber}">#${order.appointment.escrowNumber}</a></th>
      <td>${order.customer.firstName} ${order.customer.lastName} (${order.orderClosingType})</td>
      <td>$${order.amount}</td>
      <td>${getDate(order.appointment.time)}</td>`;
      var orderCurrentStatus = order.orderNotaryStatus;
      if (orderCurrentStatus == 3 && orderCurrentStatus == 4) {
        orderCurrentStatus -= 1;
      }
      if (orderCurrentStatus >= 5) {
        orderCurrentStatus -= 2;
      }
      var order_status_data = {
        0: "Scheduled",
        1: "Assigned",
        2: "Confirmed",
        3: "In-Progress",
        4: "Completed",
      };
      var btn_color = {
        0: "primary",
        1: "primary",
        2: "warning",
        3: "info",
        4: "success",
      };
      tablerow += `<td><button class="btn btn-${btn_color[orderCurrentStatus]}" onclick="order_details_page('${order._id}')">${order_status_data[orderCurrentStatus]}</button></td>
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
    notery_orders(reqData);
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
    notery_orders(reqData);
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


function isEnabled_notary(notaryID, isEnable) {
  console.log("notaryID--", notaryID, "isEnable--", isEnable);
  if (isEnable == "true") {
    swal({
      title: "Are you sure?",
      text: `You want to Disable notary`,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        showMiniLoader();
        fetch(
            `https://api.notarizetech.com/admin/notary/disableNotary`, {
              method: "POST",
              body: JSON.stringify({
                notaryIdToDisable: notaryID,
                adminId: localStorage.getItem("adminId"),
              }),
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
            if (response.status == 0) {
              swal({
                title: "Oops!",
                text: `${response.message}`,
                type: "error",
                icon: "error",
              }).then(function () {
                hideMiniLoader();
              });
            } else {
              console.log(response);
              /* function to render table */
              swal({
                title: "",
                text: `notary Disabled`,
                type: "success",
                icon: "success",
              }).then(function () {
                hideMiniLoader();
                window.location.href = "view_notery_details.html";
              });
            }
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
    });
  } else {
    swal({
      title: "Are you sure?",
      text: `You want to Enable notary`,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        showMiniLoader();
        fetch(`https://api.notarizetech.com/admin/notary/enableNotary`, {
            method: "POST",
            body: JSON.stringify({
              notaryIdToEnable: notaryID,
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
            if (response.status == 0) {
              swal({
                title: "Oops!",
                text: `${response.message}`,
                type: "error",
                icon: "error",
              }).then(function () {
                hideLoader();
              });
            } else {
              console.log(response);
              /* function to render table */
              swal({
                title: "",
                text: `notary Enabled`,
                type: "success",
                icon: "success",
              }).then(function () {
                hideLoader();
                window.location.href = "view_notery_details.html";
              });
            }
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
    });
  }
}


function notery_notes() {
  var profile = document.getElementById("profile");
  profile.innerHTML = `
              <div class="row mt-2">
                <div class="col-lg-12">
                  <textarea id="myNotes" class="form-control">${notery_text_notes}</textarea>
                </div> 
                  <div class="col-xl-2 mt-2 input-group-append">
                      <button class="btn btn-primary d-flex justify-content-center" type="button" onclick="update_notary_notes('${natary_personal_info._id}')" style="width: 10rem"><span class="mini-loader2 mx-3"></span>Update</button>
                  </div>
              </div>            
                    `;
}


function update_notary_notes(notaryID) {
  showMiniLoader2()
  var notes = document.getElementById("myNotes").value
  console.log("notes--", notes)
  fetch(`https://api.notarizetech.com/admin/notary/updateNotaryNotes`, {
      method: "POST",
      body: JSON.stringify({
        notaryId: notaryID,
        adminId: localStorage.getItem("adminId"),
        notesToUpdate: notes
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
      if (response.status == 0) {
        swal({
          title: "Oops!",
          text: `${response.message}`,
          type: "error",
          icon: "error",
        }).then(function () {
          hideMiniLoader2();
        });
      } else {
        console.log(response);
        /* function to render table */
        swal({
          title: "",
          text: `Note Updated`,
          type: "success",
          icon: "success",
        }).then(function () {
          hideMiniLoader2();
        });
      }
    })
    .catch((err) => {
      swal({
        title: "Oops!",
        text: `${err}`,
        type: "error",
        icon: "error",
      }).then(function () {
        hideMiniLoader2();
      });
    });
}

function deleteNotary(notaryId) {
  swal({
      title: "Are you sure?",
      text: `You want to Delete Notary`,
      icon: "warning",
      type: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        showLoader()
        fetch(`https://api.notarizetech.com/admin/notary/deleteNotary`, {
            method: "POST",
            body: JSON.stringify({
              notaryIdToDelete: notaryId,
              confirmDelete999: true,
              adminId: localStorage.getItem("adminId")
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
                title: "Oops",
                text: `${response.message}`,
                type: "error",
                icon: "error"
              });
              hideLoader()
            }
            console.log(response);
            swal({
              title: "",
              text: `Notary Deleted Successfully`,
              type: "success",
              icon: "success"
            }).then(function () {
              window.location.href = "./notery_list.html"
            })
          })
          .catch((err) => {
            swal({
              title: "Oops",
              text: `Error in fetching Data ${err}`,
              type: "error",
              icon: "error"
            });
            hideLoader()
          });

      }
    });
}


function editNotaryPersonalInfo(notaryId) {
  swal({
      title: "Are you sure?",
      text: `You want to Edit Notary`,
      icon: "warning",
      type: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        showLoader()
        var first_name = $("#input-first-name").val()
        var last_name = $("#input-last-name").val()
        var phone = $("#input-phone").val()
        var email = $("#input-email").val()
        var language = $("#language-known").val()
        var dl_number = $("#dl-number").val()
        var dl_issue_state = $("#dl-issue-state").val()
        var dl_issue_date = $("#dl-issue-date").val()
        var dl_exp_date = $("#dl-exp-date").val()
        var dl_docs_url = $("#driver-docs-hidden").val()
        var contract_docs_url = $("#contract-docs-hidden").val()

        var rawData = {
          notaryId: notaryId,
          firstName: first_name,
          lastName: last_name,
          email: email,
          phoneNumber: phone,
          phoneCountryCode: "+1",
          mailingEqualsHomeAddress: true,
          knownLanguages: language.split(","),
          DLNumber: dl_number,
          DLIssueState: dl_issue_state,
          DLIssueDate: dl_issue_date,
          DLExpiryDate: dl_exp_date,
          adminId: localStorage.getItem("adminId")
        }
        if (dl_docs_url.trim() != "") {
          rawData.DLDocumentURL = dl_docs_url
        }
        console.log("edit personal notary data--", rawData)
        fetch(`https://api.notarizetech.com/notary/updateProfile`, {
            method: "POST",
            body: JSON.stringify(rawData),
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
                title: "Oops",
                text: `${response.message}`,
                type: "error",
                icon: "error"
              });
              hideLoader()
            }
            console.log(response);
            if (response.updated) {
              if (contract_docs_url.trim() != "") {
                saveContractFile(notery_id, contract_docs_url)
              } else {
                swal({
                  title: "Nice",
                  text: `Notary Edited Successfully`,
                  type: "success",
                  icon: "success"
                }).then(function () {

                  window.location.href = `./view_notery_details.html?notaryId=${notaryId}`
                })
              }
            } else {
              swal({
                title: "Oops",
                text: `${response.message}`,
                type: "error",
                icon: "error"
              }).then(function () {
                hideLoader()
              })
            }

          })
          .catch((err) => {
            swal({
              title: "Oops",
              text: `Error in fetching Data ${err}`,
              type: "error",
              icon: "error"
            });
            hideLoader()
          })
      }
    });
}


function saveContractFile(notaryId, contract_docs_url) {
  var myData = {
    notaryId: notaryId,
    contractDocumentURL: contract_docs_url,
    adminId: localStorage.getItem("adminId")
  }
  console.log("contract docs data--", myData)
  fetch(`https://api.notarizetech.com/notary/saveContractDocument`, {
      method: "POST",
      body: JSON.stringify(myData),
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
    })
    .then((response) => {
      return response.json();
    }).then((response) => {
      console.log("Contract Docs--", response)
      if (response.savedData) {
        swal({
          title: "Nice",
          text: `Notary Edited Successfully`,
          type: "success",
          icon: "success"
        }).then(function () {
          window.location.href = `./view_notery_details.html?notaryId=${notaryId}`
        })
      } else {
        swal({
          title: "Oops",
          text: `${response.message}`,
          type: "error",
          icon: "error"
        }).then(function () {
          hideLoader()
        })
      }
    })
}

function editNotaryProfessionalInfo(notaryId) {
  swal({
      title: "Are you sure?",
      text: `You want to Edit Notary`,
      icon: "warning",
      type: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        showLoader()
        var cms_id = $("#input-cms-id").val()
        var cms_state = $("#input-cms-state").val()
        var cms_date = $("#input-cms-date").val()
        var cms_exp_date = $("#input-cms-exp-date").val()
        var cms_cert = $("#comission-certificate-hidden").val()
        var nna_cert = $("#nna-certificate-hidden").val()
        var lls_cert = $("#lls-certificate-hidden").val()
        var notary_bond = $("#notary-bond-hidden").val()
        var insp_fullName = $("#input-inspFull-name").val()
        var cov_fullName = $("#input-covFull-name").val()
        var policy_number = $("#ins-policy-number").val()
        var ins_exp_date = $("#ins-exp-date").val()
        var ins_claim_limit = $("#ins-claim-limit").val()
        var ins_agt_limit = $("#ins-agt-limit").val()
        if($("input[name=input-mPrinter]").val()=="Yes"){
          var mPrinter = true
        }
        else{
          var mPrinter = false
        }
        if($("input[name=input-mScanner]").val()=="Yes"){
          var mScanner = true
        }
        else{
          var mScanner = false
        }
        if($("input[name=input-hotspot]").val()=="Yes"){
          var hotspot = true
        }
        else{
          var hotspot = false
        }
        if($("input[name=input-dltPrinter]").val()=="Yes"){
          var dltPrinter = true
        }
        else{
          var dltPrinter = false
        }
        if($("input[name=input-mtpScanner]").val()=="Yes"){
          var mtpScanner = true
        }
        else{
          var mtpScanner = false
        }
         
        var rawData = {
          notaryId: notaryId,
          commissionId: cms_id,
          commissionIssueState: cms_state,
          commissionIssueDate: cms_date,
          commissionExpiryDate: cms_exp_date,
          commissionDocumentURL: cms_cert,
          NNADocumentURL: nna_cert,
          LSSDocumentURL: lls_cert,
          notaryBondDocumentURL: notary_bond,
          insuredPersonFullName: insp_fullName,
          coveredPersonName: cov_fullName,
          insurancePolicyNumber: policy_number,
          insuranceExpiryDate: ins_exp_date,
          insurancePerClaimLimit: ins_claim_limit,
          insuranceAggregateLimit: ins_agt_limit,
          hotspot: hotspot,
          mScanner: mScanner,
          mPrinter: mPrinter,
          dltPrinter: dltPrinter,
          mtpScanner: mtpScanner,
          adminId: localStorage.getItem("adminId")
        }

        console.log("edit professional notary data--", rawData)
        fetch(`https://api.notarizetech.com/notary/updateProfessionalInfo`, {
            method: "POST",
            body: JSON.stringify(rawData),
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
                title: "Oops",
                text: `${response.message}`,
                type: "error",
                icon: "error"
              });
              hideLoader()
            }
            console.log(response);
            if (response.updated) {

              swal({
                title: "Nice",
                text: `Notary Edited Successfully`,
                type: "success",
                icon: "success"
              }).then(function () {

                window.location.href = `./view_notery_details.html?notaryId=${notaryId}`
              })

            } else {
              swal({
                title: "Oops",
                text: `${response.message}`,
                type: "error",
                icon: "error"
              }).then(function () {
                hideLoader()
              })
            }

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
    });
}