import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";

// Upload single image to S3
export const uploadImageToS3 = async (file, folder = 'products') => {
  try {
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}-${file.originalname.replace(/\s+/g, '-')}`;
    
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        'original-name': file.originalname
      }
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    // Return the public URL
    const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    
    return {
      url: imageUrl,
      alt: file.originalname,
      key: fileName
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload image to S3');
  }
};

// Upload multiple images to S3
export const uploadMultipleImagesToS3 = async (files, folder = 'products') => {
  try {
    const uploadPromises = files.map(file => uploadImageToS3(file, folder));
    const uploadedImages = await Promise.all(uploadPromises);
    
    return uploadedImages;
  } catch (error) {
    console.error('Multiple S3 Upload Error:', error);
    throw new Error('Failed to upload images to S3');
  }
};

// Delete image from S3 (for cleanup)
export const deleteImageFromS3 = async (key) => {
  try {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);
    
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    return false;
  }
}; 