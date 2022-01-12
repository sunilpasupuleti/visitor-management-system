let myBucketName = "notarized-docs-2"; // put bucket name here
      let bucketRegion = "us-east-2"; // region
      let IdentityPoolId = "us-east-2:4cc2ed4b-4322-48b1-9261-44a8b2b9f2b3"; 
      AWS.config.region = bucketRegion; // Region
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId,
      });

let s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: myBucketName },
});