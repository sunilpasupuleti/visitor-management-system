function showLoader() {
  $("#panel").hide();
  $("#loader").show();
}

function hideLoader() {
  setTimeout(() => {
    $("#panel").show();
    $("#loader").hide();
  }, 0);
}
function showMiniLoader() {
  $(".mini-loader").show();
}

function hideMiniLoader() {
  setTimeout(() => {
    $(".mini-loader").hide();
  }, 800);
}
function showMiniLoader2() {
  $(".mini-loader2").show();
}

function hideMiniLoader2() {
  setTimeout(() => {
    $(".mini-loader2").hide();
  }, 800);
}

showLoader();
