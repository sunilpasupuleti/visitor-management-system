let deptValues = [];

function chipInput() {
  $('input[name="departments"]').amsifySuggestags({
    printValues: false,
    afterAdd: function (value) {
      deptValues.push(value);
    },

    afterRemove: (value) => {
      var index = deptValues.indexOf(value);
      deptValues.splice(index, 1);
    },
  });
}

async function set_departments() {
  const api_url = URL + "/admin/getDepartments";
  var result = await sendRequest("GET", api_url);
  if (result) {
    setExistingDepartments(result.departments);
    hideLoader();
  }
}

function setExistingDepartments(result) {
  let values;
  if (result && result.departments) {
    values = result.departments.join(",");
  } else {
    values = "";
  }
  $(".departments-input").empty();
  $(".departments-input").append(
    ` <input class="form-control" id="departments" name="departments" type="text"
   value='${values}' placeholder="Add / Edit departments"  required/>`
  );
  chipInput();

  // $("#departments").val(values);
}

async function updateDepartments() {
  showLoader();

  const api_url = URL + "/admin/setDepartments";
  var result = await sendRequest("POST", api_url, { departments: deptValues });
  if (result) {
    $("#myModal").modal("hide");
    hideLoader();
    swal({
      title: "Updated",
      text: `${result.message}`,
      type: "success",
      icon: "success",
    }).then(() => {
      window.location.reload();
    });
  }
}
