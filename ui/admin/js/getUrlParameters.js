var getParams = function (url) {
  var params = {};
  var parser = document.createElement("a");
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  $(".profile-username").html(`${params.name}`);
  $(".user-profile-picture , .profile-username ").on("click", () => {
    window.location.href = `profile.html?customerId=${customerId}&name=${params.name}`;
  });
  return params;
};
