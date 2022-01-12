function getInputValues() {
  var formInputValues = {
    customerId: customerId,
    firstName: $("#input-first-name").val(),
    lastName: $("#input-last-name").val(),
    email: $("#input-email").val(),
    phoneNumber: $("#input-phone-number").val(),
    phoneCountryCode: "+1",
    companyName: $("#input-company-name").val(),
    companyAddress: $("#input-company-address").val(),
    companyZipcode: $("#input-zip-code").val(),
    mailingEqualsCompanyAddress: !$("#input-mailing-address").prop("checked"),
    mailingAddress: $("#input-mailing-company-address").val(),
    mailingZipcode: $("#input-mailing-zip-code").val(),
  };

  return formInputValues;
}
function updateUserProfile(userDetails) {
  fetch("https://api.notarizetech.com/customer/updateProfile", {
    method: "POST",
    body: JSON.stringify(userDetails),
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: "Bearer " + localStorage.getItem("customer_idToken"),
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (!data.status) {
        throw new Error(data.message);
      }
      Swal.fire({
        title: "Success",
        icon: "success",
        text: "Added Details Succesfully",
      }).then(() => {
        window.location.href = `clients.html`;
      });
    })
    .catch((error) => {
      hideMiniLoader();
      $(".error-message").html(error);
      Swal.fire({
        title: "Details not updated",
        text: "Couldn't update user details",
        icon: "error",
      });
    });
}
