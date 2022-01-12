const placeDetails = {};
const languageArray = [];
const closingTypeArray = [];
const notaryUploads = [];
const buyerCheck = $('.buyer-check-label');
const deedCheck = $('.deed-check-label');
const refinanceCheck = $('.refinance-check-label');
const sellerCheck = $('.seller-check-label')
var Otherchecked = document.getElementById("input-other-check").checked


var inhouseRates = {}
var MobileRates = {}
showLoader()


const url = window.location.href
var new_url = new URL(url);
var orderId = new_url.searchParams.get("orderId")
var customerId = new_url.searchParams.get("customerId")
var name = new_url.searchParams.get("customerName")
var customerData = localStorage.getItem('customerData')
var orderData = localStorage.getItem('orderData')
console.log('orderData--', JSON.parse(orderData))

if (customerData) {
  const {
    companyAddress,
    email,
    companyName,
    firstName,
    lastName,
    phoneNumber,
    phoneCountryCode
  } = JSON.parse(customerData);
  $('#input-closing-agent-first-name').val(firstName)
  $('#input-closing-agent-last-name').val(lastName)
  $('#input-closing-agent-contact-information').val(phoneNumber)
  $('#input-closing-agent-email').val(email)
  $('#input-company-name').val(companyName)
  $('#input-company-address').val(companyAddress)
}

if (orderData) {
  const {
    amntDesc,
    appointment,
    preferredLanguage,
    orderClosingType,
    orderInvoiceType,
    adminInstr
  } = JSON.parse(orderData)
  var time = getDate(appointment.date)
  var date = new Date(appointment.date).toISOString()
  var field = document.querySelector('#input-appointment-date');
  field.value = date.slice(0, 10);

  $('#input-appointment-time').val(time.slice(11, 16))
  $('#pac-input').val(appointment.place)
  $('#input-signer-name').val(appointment.signerFullName)
  $('#input-signer-phone-number').val(appointment.signerPhoneNumber)
  $('#input-signer-address').val(appointment.signerAddress)
  $('#input-escrow-number').val(appointment.escrowNumber)
  $('#input-property-address').val(appointment.propertyAddress)
  $('#input-closing-instruction').val(appointment.closingInstructions)
  $('#input-admin-instruction').val(adminInstr)


  var closingType = $("input[name=input-closingtype-check]")
  var invoiceType = $("input[name=input-ordertype-check]")
  var language = $("input[name=input-language-check]")

  var orderClosingType2 = orderClosingType.split(",")
  for (let index = 0; index < closingType.length; index++) {
    var element = closingType[index];
    for (let i = 0; i < orderClosingType2.length; i++) {
      if (element.value.toLowerCase() == orderClosingType2[i]) {
        closingType[index].setAttribute("checked", "checked")
      }
    }
  }
  var Otherchecked = document.getElementById("input-other-check").checked
  if (Otherchecked) {
    var amt_desc = document.getElementsByClassName("amt-desc")
    var other_amt = document.getElementsByClassName("other-amt")
    for (let i = 0; i < amntDesc.length - 1; i++) {
      add_field()
    }
    for (let i = 0; i < amntDesc.length; i++) {
      amt_desc[i].value = amntDesc[i]['desc']
      other_amt[i].value = amntDesc[i]['amnt']
    }
  }

  for (let index = 0; index < invoiceType.length; index++) {
    var element = invoiceType[index];
    if (element.value.toLowerCase() == orderInvoiceType) {
      invoiceType[index].setAttribute("checked", "checked")
    }
  }

  for (let index = 0; index < preferredLanguage.length; index++) {
    var element = preferredLanguage[index];
    if (language[0].value == element) {
      language[0].setAttribute("checked", "checked")
    } else {
      if (language[1].value == element) {
        language[1].setAttribute("checked", "checked")
      }
    }
  }

  var instructionFlag = appointment.instructFlag.split(",")
  var input_instructionFlag = document.querySelectorAll('input[name="input-notary-uploads"]')
  for (let index = 0; index < instructionFlag.length; index++) {
    var element = instructionFlag[index];
    if (input_instructionFlag[index].value == element) {
      input_instructionFlag[index].setAttribute("checked", "checked")
    }
  }

}
fetch("https://api.notarizetech.com/customer/getOrderRatesForCustomer", {
  method: "POST",
  body: JSON.stringify({
    customerId: customerId,
    adminId: localStorage.getItem("adminId"),
  }),
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
    "Authorization": "Bearer " + localStorage.getItem("token"),
  }
}).then(response => {
  return response.json();
}).then(data => {

  if (!data.status) {
    throw new Error(data.message);
  }
  const {
    rates: {
      mobile_deed_only,
      mobile_refinance,
      mobile_seller,
      mobile_buyer,
      inhouse_deed_only,
      inhouse_refinance,
      inhouse_seller,
      inhouse_buyer,
      _id: orderRateId
    }
  } = data;

  inhouseRates.inhouse_deed_only = inhouse_deed_only;
  inhouseRates.inhouse_refinance = inhouse_refinance;
  inhouseRates.inhouse_seller = inhouse_seller;
  inhouseRates.inhouse_buyer = inhouse_buyer;
  MobileRates.mobile_deed_only = mobile_deed_only;
  MobileRates.mobile_refinance = mobile_refinance;
  MobileRates.mobile_seller = mobile_seller;
  MobileRates.mobile_buyer = mobile_buyer;
  buyerCheck.html(` Buyer(${inhouse_buyer}$)`);
  deedCheck.html(`Deed Only(${inhouse_deed_only}$)`);
  refinanceCheck.html(`Refinance(${inhouse_refinance}$)`);
  sellerCheck.html(`Seller(${inhouse_seller}$)`);

  localStorage.setItem('orderRateId', orderRateId)
  hideLoader()
}).catch(err => {

  Swal.fire({
    text: "Unable to fetch invoice rates. Please refresh and try again",
    icon: "error"
  })
})


$('input[type="radio"]').click(function () {
  if ($(this).is(':checked')) {
    if ($(this).val() === "Mobile") {
      buyerCheck.html(` Buyer(${ MobileRates.mobile_buyer }$)`);
      deedCheck.html(`Deed Only(${ MobileRates.mobile_deed_only}$)`);
      refinanceCheck.html(`Refinance(${ MobileRates.mobile_refinance}$)`);
      sellerCheck.html(`Seller(${ MobileRates.mobile_seller}$)`);
    } else {
      buyerCheck.html(` Buyer(${inhouseRates.inhouse_buyer}$)`);
      deedCheck.html(`Deed Only(${inhouseRates.inhouse_deed_only}$)`);
      refinanceCheck.html(`Refinance(${inhouseRates.inhouse_refinance}$)`);
      sellerCheck.html(`Seller(${inhouseRates.inhouse_seller}$)`);
    }
  }
});


$('#continue-to-upload-docs-btn').click((e) => {
  showMiniLoader();
  [...document.querySelectorAll('input[name="input-closingtype-check"]:checked')]
  .forEach((cb) => closingTypeArray.push(cb.value));

  [...document.querySelectorAll('input[name="input-language-check"]:checked')]
  .forEach((cb) => languageArray.push(cb.value));

  [...document.querySelectorAll('input[name="input-notary-uploads"]:checked')]
  .forEach((cb) => notaryUploads.push(cb.value));


  var amntDescData = []
  var amt_desc = document.getElementsByClassName("amt-desc")
  var other_amt = document.getElementsByClassName("other-amt")
  for (let i = 0; i < amt_desc.length; i++) {
    var temp = {
      desc: amt_desc[i].value,
      amnt: other_amt[i].value
    }
    amntDescData.push(temp)
  }


  var signingRequestDetails = {
    orderId: orderId,
    customerId: customerId,
    adminId: localStorage.getItem("adminId"),
    orderClosingType: closingTypeArray,
    orderInvoiceType: $('input[name="input-ordertype-check"]:checked').val(),
    aptDate: (new Date($('#input-appointment-date').val() + " " + $('#input-appointment-time').val())
      .toString()),
    aptPlace: placeDetails.formattedAddress,
    aptLatitude: placeDetails.lat,
    aptLongitude: placeDetails.lng,
    aptZipcode: placeDetails.zipCode,
    preferredLanguageArray: languageArray,
    signerFullName: $('#input-signer-name').val(),
    signerPhoneCountryCode: "+1",
    signerPhoneNumber: $('#input-signer-phone-number').val(),
    closingInstructions: $('#input-closing-instruction').val(),
    instructionFlag: notaryUploads,
    escrowNumber: $('#input-escrow-number').val(),
    firstName: $('#input-closing-agent-first-name').val(),
    lastName: $('#input-closing-agent-last-name').val(),
    phoneNumber: $('#input-closing-agent-contact-information').val(),
    email: $('#input-closing-agent-email').val(),
    propertyAddress: $('#input-property-address').val(),
    companyName: $('#input-company-name').val(),
    companyAddress: $('#input-company-address').val(),
    adminInstr: $('#input-admin-instruction').val(),
    amntDesc: amntDescData

  };
  console.log(signingRequestDetails)

  fetch('https://api.notarizetech.com/customer/updateOrder', {
    method: 'POST',
    body: JSON.stringify(signingRequestDetails),
    headers: {
      "Content-Type": "application/json;chardet=UTF-8",
      "Authorization": "Bearer " + localStorage.getItem("token"),
    }
  }).then(response => {
    return response.json();
  }).then(response => {
    console.log("edit order responce--", response)
    if (!response.updated) {
      Swal.fire({
        title: "error",
        icon: "error",
        text: `${response.message}`,
      })
    } else {
      Swal.fire({
        title: "Success",
        icon: "success",
        text: "Added Details Succesfully",
      }).then(() => {
        const {
          data: {
            _id: orderId
          }
        } = response
        window.location.href =
          `UploadDocuments.html?orderId=${orderId}&name=${name}&customerId=${customerId}`
      })
    }


  }).catch(err => {
    hideMiniLoader();
    $('.error-message').html(
      `<p class='text-danger'> There was some Error in uploading data. Please Try Again <br /> ${err} !</p>`
    );
  });

});

function initMap() {

  var options = {
    center: {
      lat: 40.749933,
      lng: -73.98633
    },
    zoom: 13,
  }
  const map = new google.maps.Map(document.getElementById("map"), options);
  const input = document.getElementById("pac-input");
  const fields = {
    componentRestrictions: {
      country: "us"
    },
    fields: ["place_id", "geometry", "name", "formatted_address", "address_components"],
    origin: map.getCenter(),

  };
  const autocomplete = new google.maps.places.Autocomplete(
    input,
    fields
  );
  autocomplete.bindTo("bounds", map);
  const infowindow = new google.maps.InfoWindow();
  const infowindowContent = document.getElementById("infowindow-content");
  infowindow.setContent(infowindowContent);
  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  autocomplete.addListener("place_changed", () => {
    infowindow.close();
    marker.setVisible(false);
    const place = autocomplete.getPlace();
    if (place) {
      if (!place.geometry || !place.geometry.location) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        swal({
          title: "Please enter valid Location",
          text: "No details available for input: '" + place.name + "'",
          icon: "error"
        })

      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(10);
      }
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);


      getPlaceDetails(place)

    } else {
      swal({
        title: "Please enter valid Location",
        text: "Unable to find location. Please try again",
        icon: "error"
      })
    }


  });

}


function getPlaceDetails(place) {
  placeDetails.lat = place.geometry.location.lat();
  placeDetails.lng = place.geometry.location.lng();
  placeDetails.formattedAddress = place.formatted_address;
  for (var i = 0; i < place.address_components.length; i++) {
    for (var j = 0; j < place.address_components[i].types.length; j++) {
      if (place.address_components[i].types[j] == "postal_code") {
        placeDetails.zipCode = place.address_components[i].long_name;
      }
    }
  }

}

function closingAgent() {
  var played_collapse = '.closingAgent';
  $(played_collapse).collapse('toggle');
}

function view_map() {
  var played_collapse = '.view_map';
  $(played_collapse).collapse('toggle');
}


function toggleAmntDesc() {
  var checked = document.getElementById("input-other-check").checked
  if (checked) {
    document.getElementById("add_field").hidden = false
    var amt_desc = document.getElementsByClassName("amt-desc")
    var other_amt = document.getElementsByClassName("other-amt")
    var amt_desc_label = document.getElementsByClassName("amt-desc-label")
    var other_amt_label = document.getElementsByClassName("other-amt-label")
    for (let i = 0; i < amt_desc.length; i++) {
      amt_desc[i].hidden = false
      other_amt[i].hidden = false
      amt_desc_label[i].hidden = false
      other_amt_label[i].hidden = false

    }
  } else {
    document.getElementById("add_field").hidden = true
    var amt_desc = document.getElementsByClassName("amt-desc")
    var other_amt = document.getElementsByClassName("other-amt")
    var amt_desc_label = document.getElementsByClassName("amt-desc-label")
    var other_amt_label = document.getElementsByClassName("other-amt-label")
    for (let i = 0; i < amt_desc.length; i++) {
      amt_desc[i].hidden = true
      other_amt[i].hidden = true
      amt_desc_label[i].hidden = true
      other_amt_label[i].hidden = true
    }
  }
}
toggleAmntDesc()

function add_field() {
  var html = `<div class="col-lg-8">
                  <div class="form-group">
                    <label class="form-control-label amt-desc-label" for="input-amt-desc">Amount Description</label>
                    <input id="input-amt-desc" name="input-amt-desc" class=" amt-desc form-control text-default"
                      placeholder="If Other is selected" required type="text"/>
                  </div>
                </div>
                <div class="col-lg-2">
                  <div class="form-group">
                    <label class="form-control-label other-amt-label" for="input-other-amt">Amount</label>
                    <input id="input-other-amt" name="input-other-amt" class=" other-amt form-control text-default"
                      placeholder="Add Amount If Other is selected" required type="number"/>
                  </div>
                </div>`
  $("#add_field").after(html);
}