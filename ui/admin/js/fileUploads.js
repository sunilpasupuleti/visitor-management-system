var completeFileList;

const url = window.location.href
var new_url = new URL(url);
var orderId = new_url.searchParams.get("orderId")
var customerId = new_url.searchParams.get("customerId")
var name = new_url.searchParams.get("customerName")
var adminId = localStorage.getItem("adminId");

console.log("orderId--",orderId)
console.log("customerId--",customerId)
console.log("adminId--",adminId)

var upload;
var failedUploadFiles = [];
var deletedDocsArray = [];
var uploadedDocumentObjectArray = [];
var UploadedDocumentName = [];
// Initialize the Amazon Cognito credentials provider
hideMiniLoader();
var filename;

function uploadFile(files) {
  if (!customerId) return;
  [...files].forEach((file) => {
    let fileSize = file.size;
    let fileLength = Math.round(fileSize.toString().length / 2);
    let fileId = fileSize.toString().slice(0, fileLength);
    let progressBar = $(`#${fileId}-myBar`);
    let progressDiv = $(`#${fileId}-myProgress`);
    let progressVal = $(`#${fileId}-progressValue`);

    upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: myBucketName,
        Key: `c/${customerId}/o/${orderId}/${file.name}`,
        Body: file,
        ContentDisposition: "inline",
        ContentType: file.type,
      },
    }).on("httpUploadProgress", function (progress) {
      let progressPercentage = Math.round(
        (progress.loaded / progress.total) * 100
      );

      progressBar.css("width", progressPercentage + "%");
      if (progressPercentage < 100) {
        progressBar.addClass("bg-success");
        progressVal.html(progressPercentage + "%");
      } else if (progressPercentage == 100) {
        progressBar.addClass("bg-success");
        progressVal.html("Uploaded");
      }
    });

    let promise = upload.promise();
    promise
      .then(
        function (data) {
          const { Location, Key } = data;

          let reqData = {
            documentName: Key.slice(Key.lastIndexOf("/") + 1),
            documentURL: Location,
            customerId: customerId,
            orderId: orderId,
            adminId: adminId,
          };
          progressBar.addClass("bg-success");
          console.log("file upload data-",reqData);
          uploadedDocumentObjectArray.push(reqData);
          UploadedDocumentName.push(reqData.documentName.trim());
        },
        function (err) {
          progressBar.addClass("bg-danger");
          progressVal
            .html(`Error in Uploading, Please re-upload file : ${err.message} `)
            .addClass("text-danger");

          Swal.fire({
            title: "Unsuccessful",
            text: `Error in uploading ${file.name} `,
            position: "bottom-end",
            icon: "error",
            timer: "3500",
            toast: true,
            showConfirmButton: false,
          });
        }
      )
      .catch(console.error);
  });
}

$(".upload-documents-button").on("click", () => {
  showMiniLoader();
  deletedDocsArray.forEach((val) => {
    let indx = UploadedDocumentName.indexOf(val);
    if (indx != -1) {
      UploadedDocumentName.splice(indx, 1);
      uploadedDocumentObjectArray.splice(indx, 1);
    }
  });
  uploadMultipleDocuments(uploadedDocumentObjectArray);
});

function uploadMultipleDocuments(fileData) {
  var uploadFiles =  {
    documentArray: fileData,
    customerId: customerId,
    adminId: adminId,
    orderId: orderId,
  }
  console.log("uploadFiles--",uploadFiles)
  fetch(
    "https://api.notarizetech.com/customer/uploadMultipleDocumentsForOrder",
    {
      method: "POST",
      body: JSON.stringify(uploadFiles),
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log('upload data--',data)
      if (!data.status) {
        throw new Error(data.message);
      }
      let failedDocumentCount = fileData.length - data.uploadCount;
      if (!failedDocumentCount) {
        Swal.fire({
          toast: true,
          title: "Success",
          text: "Successfully Upload all documents",
          icon: "success",
          position: "bottom-end",
          timer: "3500",
        }).then(() => {
          hideMiniLoader();
          window.location.href = `order_details.html?orderId=${orderId}`;
        });
      } else {
        throw new Error(`Failed Document Count : ${failedDocumentCount}`);
      }
    })
    .catch((error) => {
      hideMiniLoader();
      Swal.fire({
        toast: true,
        title: "Upload Document Failed",
        text: `${error}. Please try again`,
        icon: "error",
        position: "bottom-end",
        timer: "3500",
      });
    });
}
function deleteRow(row) {
  let documentName =
    row.parentNode.parentNode.parentNode.firstElementChild.innerHTML;
  deletedDocsArray.push(("" + documentName + "").trim());
  var i = row.parentNode.parentNode.parentNode.rowIndex;
  document.getElementById("upload-table").deleteRow(i);
  setTimeout(upload.abort.bind(upload), 1000);
}
