const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

var company = params.company_id;
var otpCodeFromResponse = null;
var selfieImage = null;
var phone = null;

if (!company) {
  showError("no company id passed");
} else {
  hideLoader();
  $(".otpInput").hide();
  $("#registerForm").hide();
  $("#phoneModal").modal({
    backdrop: "static",
    keyboard: false,
  });
}

async function getUserMedia(
  successCallback = () => null,
  errorCallback = () => null
) {
  await navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: "user",
      },
      audio: false,
    })
    .then(successCallback)
    .catch((err) => {
      console.log(err);

      if (err.name == "NotFoundError" || err.name == "DevicesNotFoundError") {
        //required track is missing
        alert("NO devices found");
      } else if (
        err.name == "NotReadableError" ||
        err.name == "TrackStartError"
      ) {
        //webcam or mic are already in use
        alert("Camera is already in use");
      } else if (
        err.name == "OverconstrainedError" ||
        err.name == "ConstraintNotSatisfiedError"
      ) {
        alert("Constraints unsatisfied");

        //constraints can not be satisfied by avb. devices
      } else if (
        err.name == "NotAllowedError" ||
        err.name == "PermissionDeniedError"
      ) {
        //permission denied in browser
        alert(
          "Permission denied to use the camera ! Try again by allowing the permission"
        );
      } else if (err.name == "TypeError" || err.name == "TypeError") {
        //empty constraints object
        alert("Empty Constraints provided");
      } else {
        alert("Some unknown error occured while starting camera");
        //other errors
      }
      errorCallback();
    });
}

async function captureSelfie(mode) {
  $("#selfieStream").hide();
  if (mode !== "retake") {
    $("#captureSelfie").hide();
    $("#retakeSelfie").hide();
  }

  if (mode === "retake") {
    $("#selfieStream").show();
  }

  let camera_button = document.querySelector("#startCamera");
  let video = document.querySelector("#selfieStream");
  let click_button = document.querySelector("#captureSelfie");
  let canvas = document.querySelector("#selfie");
  let stream = null;
  if (mode === "retake") {
    await getUserMedia((result) => {
      $("#selfie").hide();
      stream = result;
      video.srcObject = stream;
    });
  }
  camera_button.addEventListener("click", async function () {
    $("#selfieStream").show();
    await getUserMedia((result) => {
      stream = result;
      video.srcObject = stream;
      $("#selfie").hide();
      $("#startCamera").hide();
      $("#captureSelfie").show();
      $("#retakeSelfie").show();
    });
  });
  // hide remaining buttons
  click_button.addEventListener("click", function () {
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL("image/jpeg");
    // hide stream
    $("#selfieStream").hide();
    $("#selfie").show();
    // data url of the image
    selfieImage = image_data_url;
    stream.getTracks().forEach((track) => track.stop());
  });
}

function onRetakeSelfie() {
  captureSelfie("retake");
}

function onChangeInputFile(e, labelName) {
  let fileName = e.target.value.split("\\").pop();
  $("." + labelName).html(fileName);
  console.log(fileName);
}

async function onRegisterVisitor(e) {
  e.preventDefault();
  const file = $("#doc-proof").get(0).files[0];

  let name = $("#name").val();
  let companyName = $("#com-name").val();
  let address = $("#address").val();
  let idType = $("#doc-type").val();
  if (
    !name ||
    !companyName ||
    !address ||
    !idType ||
    !file ||
    !selfieImage ||
    !phone ||
    !company
  ) {
    showError("All fields are required");
    return;
  }
  showLoader();
  const api_url = URL + "/visitor/saveVisitorWeb";
  let selfieStringBase64 = selfieImage.split(/,\s*/);
  let formData = new FormData();

  formData.append("doc-proof", file);
  formData.append("selfie", selfieStringBase64[1]);
  formData.append("name", name);
  formData.append("companyName", companyName);
  formData.append("address", address);
  formData.append("idType", idType);
  formData.append("phone", phone);
  formData.append("company", company);

  $.ajax({
    url: api_url,
    method: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      if (response.visitor) {
        localStorage.setItem("token", response.token);
        localStorage.setItem(
          "visitor-data",
          window.btoa(JSON.stringify(response.visitor))
        );
        location.href = "/visitor";
      }

      hideLoader();
    },
    error: function (error) {
      console.log(error);
      let title = "Error occured";
      hideLoader();
      if (error.responseJSON) {
        console.log(error);
        title = error.responseJSON.message;
      } else {
        title = error.statusText;
      }
      showError(title);
    },
  });
}
async function onSearchVisitor(e) {
  e.preventDefault();
  if (otpCodeFromResponse) {
    verifyOtp();
    return;
  }
  var phoneNum = $("#phone").val();
  $("#phone").attr("disabled", true);
  const api_url =
    URL + "/visitor/searchVisitor?phone=" + phoneNum + "&companyId=" + company;
  await sendRequest("GET", api_url)
    .then((result) => {
      console.log(result);
      hideLoader();
      if (result.otp) {
        otpCodeFromResponse = result.otp;
        phone = phoneNum;
        $(".otpInput").show();
        $(".otpButton").html("VERIFY OTP");
      }

      if (result.visitor) {
        localStorage.setItem("token", result.token);
        localStorage.setItem(
          "visitor-data",
          window.btoa(JSON.stringify(result.visitor))
        );
        location.href = "/visitor";
        $("#registerForm").show();
        $("#phoneModal").modal("hide");
      }
    })
    .catch(() => {
      $("#phone").attr("disabled", false);
      $("#phone").val("");
    });
}

async function resendOtp(e) {
  otpCodeFromResponse = null;
  onSearchVisitor(e);
  var phone = $("#phone").val();
  $("#phone").attr("disabled", true);
  const api_url = URL + "/visitor/resendOtp?phone=" + phone;
  var result = await sendRequest("GET", api_url);
  if (result) {
    hideLoader();
    otpCodeFromResponse = result.otp;
    $("#otp").val("");
  }
}

function changeNumber(e) {
  otpCodeFromResponse = null;
  $(".otpInput").hide();
  $("#otp").val("");
  $("#phone").attr("disabled", false);
  $("#phone").val("");
  $(".otpButton").html("CONTINUE");
}
async function verifyOtp() {
  let otp = $("#otp").val();
  if (!otpCodeFromResponse) {
    showError("Invalid response");
    return;
  }
  if (+otp === otpCodeFromResponse) {
    $("#registerForm").show();
    $("#phoneModal").modal("hide");
  } else {
    showError("Invalid Otp! Try again.");
  }
}

function showError(message, title = "Error") {
  swal({
    title: title,
    text: message,
    type: "error",
    icon: "error",
  }).then(() => {});
}

captureSelfie();
