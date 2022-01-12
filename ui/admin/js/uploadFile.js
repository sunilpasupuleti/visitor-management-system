let myBucketName = "notarized-docs-2"; // put bucket name here
let bucketRegion = "us-east-2"; // region
let IdentityPoolId = 'us-east-2:4cc2ed4b-4322-48b1-9261-44a8b2b9f2b3'; // this is the id you get on generating id pool on AWS

AWS.config.region = bucketRegion; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
});


let s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: myBucketName }
});


function myUploader(id) {
    showLoader()
    let files = document.getElementById(id).files;
    let hidden_url = document.getElementById(`${id}-hidden`)

    if (!files.length) {
      return false
    }

    let file = files[0];
    console.log(file);
    let fileName = file.name;

    let upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: myBucketName,
        Key: fileName,
        Body: file,
        ContentDisposition: "inline",
        ContentType: file.type,
      }
    });
  
    let promise = upload.promise();
  
    promise.then(
      function(data) {
        console.log("Aws url--",data.Location)
        hidden_url.value = data.Location
        swal({
          title: "Nice",
          text: `Document Uploaded`,
          type: "success",
          icon: "success",
        }).then(()=>hideLoader())
    },
      function(err) {
        swal({
          title: "Oops",
          text: `${err}`,
          type: "error",
          icon: "error",
        }).then(()=>hideLoader())
      }
    );

  }