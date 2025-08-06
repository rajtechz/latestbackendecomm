
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// // Console log the AWS credentials and region for debugging
// console.log("AWS Region:", process.env.AWS_REGION);
// console.log("AWS Access Key ID:", process.env.AWS_ACCESS_KEY_ID);
// console.log("AWS Secret Access Key:", process.env.AWS_SECRET_ACCESS_KEY ? "***SET***" : "***NOT SET***");
// console.log("AWS S3 Bucket:", process.env.AWS_S3_BUCKET_NAME);

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});