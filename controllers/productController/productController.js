import Product from '../../models/product/Product.js';
import { uploadMultipleImagesToS3, deleteImageFromS3 } from '../../utils/s3Upload.js';

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single product
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create product with image upload
export const createProduct = async (req, res) => {
  try {
    let productData = { ...req.body };
    
    // Handle image uploads if files are present
    if (req.files && req.files.length > 0) {
      try {
        const uploadedImages = await uploadMultipleImagesToS3(req.files);
        productData.images = uploadedImages.map(img => ({
          url: img.url,
          alt: img.alt
        }));
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images: ' + uploadError.message
        });
      }
    }

    const product = await Product.create(productData);
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully with images'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product with image upload
export const updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    // Handle new image uploads if files are present
    if (req.files && req.files.length > 0) {
      try {
        const uploadedImages = await uploadMultipleImagesToS3(req.files);
        const newImages = uploadedImages.map(img => ({
          url: img.url,
          alt: img.alt
        }));
        
        // If replacing all images, use new images
        // If adding to existing, combine with existing images
        if (req.body.replaceImages === 'true') {
          updateData.images = newImages;
        } else {
          // Get existing product to combine images
          const existingProduct = await Product.findById(req.params.id);
          if (existingProduct) {
            updateData.images = [...existingProduct.images, ...newImages];
          } else {
            updateData.images = newImages;
          }
        }
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images: ' + uploadError.message
        });
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product and its images
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from S3 if they exist
    if (product.images && product.images.length > 0) {
      try {
        const deletePromises = product.images.map(image => {
          // Extract key from URL
          const urlParts = image.url.split('/');
          const key = urlParts.slice(3).join('/'); // Remove https://bucket.s3.region.amazonaws.com/
          return deleteImageFromS3(key);
        });
        await Promise.all(deletePromises);
      } catch (deleteError) {
        console.error('Failed to delete images from S3:', deleteError);
        // Continue with product deletion even if image deletion fails
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Product and associated images deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete specific image from product
export const deleteProductImage = async (req, res) => {
  try {
    const { productId, imageIndex } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.images || imageIndex >= product.images.length) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const imageToDelete = product.images[imageIndex];
    
    // Delete from S3
    try {
      const urlParts = imageToDelete.url.split('/');
      const key = urlParts.slice(3).join('/');
      await deleteImageFromS3(key);
    } catch (deleteError) {
      console.error('Failed to delete image from S3:', deleteError);
    }

    // Remove image from product
    product.images.splice(imageIndex, 1);
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
