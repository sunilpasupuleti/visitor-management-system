
function getDate(currentDate) {
    let date = new Date(currentDate);
    let time = date.toLocaleTimeString([], {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });
    let completeDate = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ,${time} `;
    return completeDate;
  }

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
    
    return params;
  };