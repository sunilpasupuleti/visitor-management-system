$(() => {
    $('#input-appointment-date').pickadate({
        format: "mm-dd-yyyy"
    });
    $('#input-appointment-time').pickatime({
        min: [6, 0],
        max: [21, 0]
    });
})
const placeDetails = {};
const languageArray = [];
const closingTypeArray = [];
const notaryUploads = [];
const buyerCheck = $('.buyer-check-label');
const deedCheck = $('.deed-check-label');
const refinanceCheck = $('.refinance-check-label');
const sellerCheck = $('.seller-check-label')

var inhouseRates = {}
var MobileRates = {}



var customerData = localStorage.getItem('customerData')

const url = window.location.href
var new_url = new URL(url);
var customerId = new_url.searchParams.get("customerId")



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

fetch("https://api.notarizetech.com/admin/customer/getOrderRates", {
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
    console.log("data----", data)
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
    buyerCheck.html(` Buyer($${inhouse_buyer})`);
    deedCheck.html(`Deed Only($${inhouse_deed_only})`);
    refinanceCheck.html(`Refinance($${inhouse_refinance})`);
    sellerCheck.html(`Seller($${inhouse_seller})`);

    localStorage.setItem('orderRateId', orderRateId)
}).catch(err => {

    Swal.fire({
        text: "Unable to fetch invoice rates. Please refresh and try again",
        icon: "error"
    })
})


$('input[type="radio"]').click(function () {
    if ($(this).is(':checked')) {
        if ($(this).val() === "Mobile") {
            buyerCheck.html(` Buyer($${ MobileRates.mobile_buyer })`);
            deedCheck.html(`Deed Only($${ MobileRates.mobile_deed_only})`);
            refinanceCheck.html(`Refinance($${ MobileRates.mobile_refinance})`);
            sellerCheck.html(`Seller($${ MobileRates.mobile_seller})`);
        } else {
            buyerCheck.html(` Buyer($${inhouseRates.inhouse_buyer})`);
            deedCheck.html(`Deed Only($${inhouseRates.inhouse_deed_only})`);
            refinanceCheck.html(`Refinance($${inhouseRates.inhouse_refinance})`);
            sellerCheck.html(`Seller($${inhouseRates.inhouse_seller})`);
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
    if(document.getElementById("input-other-check").checked){
        var amt_desc = document.getElementsByClassName("amt-desc")
        var other_amt = document.getElementsByClassName("other-amt")
        for(let i =0; i<amt_desc.length;i++){
        var temp = {desc:amt_desc[i].value,amnt:other_amt[i].value}
        amntDescData.push(temp)
        }
    }
    

    var signingRequestDetails = {
        customerId: customerId,
        adminId: localStorage.getItem("adminId"),
        orderRateId: localStorage.getItem('orderRateId'),
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

    fetch('https://api.notarizetech.com/customer/createOrder', {
        method: 'POST',
        body: JSON.stringify(signingRequestDetails),
        headers: {
            "Content-Type": "application/json;chardet=UTF-8",
            "Authorization": "Bearer " + localStorage.getItem("token"),
        }
    }).then(response => {
        return response.json();
    }).then(response => {
        console.log("respoonce order--", response)
        if (!response.status) {
            Swal.fire({
                title: "error",
                icon: "error",
                text: `${response.message}`,
            })
        }
        else{
            Swal.fire({
                title: "Success",
                icon: "success",
                text: "Added Details Succesfully",
            }).then(() => {
                hideMiniLoader()
                window.location.href =
                    `UploadDocuments.html?orderId=${response.data._id}&customerId=${customerId}`
            })
        }
    }).catch(err => {
        hideMiniLoader();
        $('.error-message').html(
            `<p class='text-danger'> Oh no! Sorry you having trouble. Please Try Again. <br /> ${err} !</p>`
        );
    });

});

function initMap() {

    var options = {
        center: {
            lat: 36.114704,
            lng: -115.201462
        },
        zoom: 10,
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

  function toggleAmntDesc(){
    var checked = document.getElementById("input-other-check").checked
    if(checked){
      document.getElementById("add_field").hidden = false
      var amt_desc = document.getElementsByClassName("amt-desc")
      var other_amt = document.getElementsByClassName("other-amt")
      var amt_desc_label = document.getElementsByClassName("amt-desc-label")
      var other_amt_label = document.getElementsByClassName("other-amt-label")
      for(let i =0; i<amt_desc.length;i++){
        amt_desc[i].hidden = false
        other_amt[i].hidden = false
        amt_desc_label[i].hidden = false
        other_amt_label[i].hidden = false

      }
    }
    else{
      document.getElementById("add_field").hidden = true
      var amt_desc = document.getElementsByClassName("amt-desc")
      var other_amt = document.getElementsByClassName("other-amt")
      var amt_desc_label = document.getElementsByClassName("amt-desc-label")
      var other_amt_label = document.getElementsByClassName("other-amt-label")
      for(let i =0; i<amt_desc.length;i++){
        amt_desc[i].hidden = true
        other_amt[i].hidden = true
        amt_desc_label[i].hidden = true
        other_amt_label[i].hidden = true
      }
    }
  }
  toggleAmntDesc()

  function add_field(){
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