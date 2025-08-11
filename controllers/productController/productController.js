import Product from '../../models/product/Product.js';
import { uploadImageToS3 } from '../../utils/s3Upload.js';

// Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can create products.'
      });
    }

    // Helper function to extract first value from array or return the value itself
    const extractFirstValue = (value) => {
      if (Array.isArray(value)) {
        return value[0]; // Return first value if it's an array
      }
      return value; // Return the value itself if it's not an array
    };

    // Extract and process form data, handling arrays from Postman
    const { 
      title, slug, description, shortDescription, currentPrice, originalPrice, bestPrice,
      category, subCategory, brand, model, sku, displayOrder, isActive, isFeatured, 
      isNew, stockQuantity, allowBackorder, availableSizes, availableColors,
      labels, tags, keywords, material, careInstructions, specifications,
      metaTitle, metaDescription, thumbnailImageIndex 
    } = req.body;

    // Extract first values for single-value fields
    const processedTitle = extractFirstValue(title);
    const processedSlug = extractFirstValue(slug);
    const processedDescription = extractFirstValue(description);
    const processedShortDescription = extractFirstValue(shortDescription);
    const processedCurrentPrice = extractFirstValue(currentPrice);
    const processedOriginalPrice = extractFirstValue(originalPrice);
    const processedBestPrice = extractFirstValue(bestPrice);
    const processedCategory = extractFirstValue(category);
    const processedSubCategory = extractFirstValue(subCategory);
    const processedBrand = extractFirstValue(brand);
    const processedModel = extractFirstValue(model);
    const processedSku = extractFirstValue(sku);
    const processedDisplayOrder = extractFirstValue(displayOrder);
    const processedIsActive = extractFirstValue(isActive);
    const processedIsFeatured = extractFirstValue(isFeatured);
    const processedIsNew = extractFirstValue(isNew);
    const processedStockQuantity = extractFirstValue(stockQuantity);
    const processedAllowBackorder = extractFirstValue(allowBackorder);
    const processedMaterial = extractFirstValue(material);
    const processedCareInstructions = extractFirstValue(careInstructions);
    const processedMetaTitle = extractFirstValue(metaTitle);
    const processedMetaDescription = extractFirstValue(metaDescription);
    const processedThumbnailImageIndex = extractFirstValue(thumbnailImageIndex);
    
    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug: processedSlug });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this slug already exists'
      });
    }
    
    // Handle multiple images upload
    let uploadedImages = [];
    let thumbnailImage = { url: '', alt: `${processedTitle} thumbnail` };
    
    // Add debug logging
    console.log('Controller - Files received:', req.files);
    if (req.files) {
      console.log('Images field:', req.files.images ? req.files.images.length : 0);
      console.log('Thumbnail field:', req.files.thumbnailImage ? req.files.thumbnailImage.length : 0);
    }
    
    // Handle regular product images
    if (req.files && req.files.images && req.files.images.length > 0) {
      try {
        // Get regular image files
        const regularImageFiles = req.files.images;
        console.log('Regular image files:', regularImageFiles.length);
        
        // Upload regular product images
        const uploadPromises = regularImageFiles.map(async (file, index) => {
          const uploadedImage = await uploadImageToS3(file, `products/${processedCategory}`);
          return {
            url: uploadedImage.url,
            alt: req.body[`imageAlt${index}`] || `${processedTitle} image ${index + 1}`,
            order: index,
            isPrimary: index === 0 // First image is primary
          };
        });
        uploadedImages = await Promise.all(uploadPromises);
        
        // Handle thumbnail image separately
        if (req.files.thumbnailImage && req.files.thumbnailImage.length > 0) {
          const thumbnailFile = req.files.thumbnailImage[0];
          const uploadedThumbnail = await uploadImageToS3(thumbnailFile, `products/${processedCategory}/thumbnails`);
          thumbnailImage = {
            url: uploadedThumbnail.url,
            alt: req.body.thumbnailAlt || `${processedTitle} thumbnail`
          };
        } else {
          // Fallback: use first regular image as thumbnail if no thumbnail uploaded
          thumbnailImage = {
            url: uploadedImages[0].url,
            alt: uploadedImages[0].alt
          };
        }
        
      } catch (uploadError) {
        console.error('Images upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required in the "images" field'
      });
    }
    
    // Ensure we have at least one image
    if (uploadedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required'
      });
    }
    
    // Parse arrays from string inputs with robust handling
    const parseArrayField = (field, isJson = false) => {
      if (!field) return [];
      
      // If it's already an array, handle it properly
      if (Array.isArray(field)) {
        // For array fields, if Postman sends an array, we need to flatten it
        if (isJson) {
          // For JSON fields, try to parse each item as JSON
          return field.flatMap(item => {
            if (typeof item === 'string') {
              try {
                return JSON.parse(item);
              } catch (error) {
                console.error('JSON parsing error for array item:', error);
                return [];
              }
            }
            return item;
          });
        } else {
          // For string arrays, split each item by comma and flatten
          return field.flatMap(item => {
            if (typeof item === 'string') {
              return item.split(',').map(subItem => subItem.trim()).filter(subItem => subItem.length > 0);
            }
            return item;
          });
        }
      }
      
      // If it's a string and should be JSON parsed
      if (isJson && typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (error) {
          console.error('JSON parsing error:', error);
          return [];
        }
      }
      
      // If it's a string, split by comma
      if (typeof field === 'string') {
        return field.split(',').map(item => item.trim()).filter(item => item.length > 0);
      }
      
      return [];
    };
    
    // Add debug logging
    console.log('Debug - availableSizes:', availableSizes);
    console.log('Debug - availableColors:', availableColors);
    console.log('Debug - labels:', labels);
    console.log('Debug - specifications:', specifications);
    
    const parsedSizes = parseArrayField(availableSizes);
    const parsedColors = parseArrayField(availableColors, true);
    const parsedLabels = parseArrayField(labels);
    const parsedTags = parseArrayField(tags);
    const parsedKeywords = parseArrayField(keywords);
    const parsedSpecifications = parseArrayField(specifications, true);
    
    // Add debug logging for parsed results
    console.log('Debug - parsedSizes:', parsedSizes);
    console.log('Debug - parsedColors:', parsedColors);
    console.log('Debug - parsedLabels:', parsedLabels);
    console.log('Debug - parsedSpecifications:', parsedSpecifications);
    
    // Handle thumbnail image
    // The thumbnailImage object is now populated above, so this block is no longer needed.
    
    // Create product
    const product = new Product({
      title: processedTitle,
      slug: processedSlug,
      description: processedDescription,
      shortDescription: processedShortDescription,
      currentPrice: parseFloat(processedCurrentPrice),
      originalPrice: processedOriginalPrice ? parseFloat(processedOriginalPrice) : undefined,
      bestPrice: processedBestPrice ? parseFloat(processedBestPrice) : undefined,
      category: processedCategory,
      subCategory: processedSubCategory,
      brand: processedBrand,
      model: processedModel,
      sku: processedSku,
      images: uploadedImages,
      thumbnailImage,
      displayOrder: processedDisplayOrder || 0,
      isActive: processedIsActive !== undefined ? processedIsActive : true,
      isFeatured: processedIsFeatured !== undefined ? processedIsFeatured : false,
      isNew: processedIsNew !== undefined ? processedIsNew : false,
      stockQuantity: processedStockQuantity || 0,
      allowBackorder: processedAllowBackorder !== undefined ? processedAllowBackorder : false,
      availableSizes: parsedSizes,
      availableColors: parsedColors,
      labels: parsedLabels,
      tags: parsedTags,
      keywords: parsedKeywords,
      material: processedMaterial,
      careInstructions: processedCareInstructions,
      specifications: parsedSpecifications,
      metaTitle: processedMetaTitle,
      metaDescription: processedMetaDescription,
      createdBy: req.user._id
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully by admin'
    });
    
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all products (Admin)
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, subCategory, isActive, isFeatured, isNew, labels, brand } = req.query;
    
    const query = {};
    
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (isNew !== undefined) query.isNew = isNew === 'true';
    if (labels) query.labels = { $in: labels.split(',') };
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .populate('createdBy', 'name email')
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single product by ID
export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
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
    console.error('Get single product error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product (Admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can update products.'
      });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Helper function to extract first value from array or return the value itself
    const extractFirstValue = (value) => {
      if (Array.isArray(value)) {
        return value[0]; // Return first value if it's an array
      }
      return value; // Return the value itself if it's not an array
    };
    
    // Handle new images upload if provided
    let updatedImages = product.images;
    
    if (req.files && req.files.images && req.files.images.length > 0) {
      try {
        const uploadPromises = req.files.images.map(async (file, index) => {
          const uploadedImage = await uploadImageToS3(file, `products/${product.category}`);
          return {
            url: uploadedImage.url,
            alt: req.body[`imageAlt${index}`] || `${req.body.title || product.title} image ${index + 1}`,
            order: updatedImages.length + index,
            isPrimary: false
          };
        });
        const newImages = await Promise.all(uploadPromises);
        updatedImages = [...updatedImages, ...newImages];
      } catch (uploadError) {
        console.error('Images upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images'
        });
      }
    }
    
    // Check if slug is being updated and if it already exists
    const processedSlug = extractFirstValue(req.body.slug);
    if (processedSlug && processedSlug !== product.slug) {
      const existingProduct = await Product.findOne({ slug: processedSlug });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this slug already exists'
        });
      }
    }
    
    // Parse arrays from string inputs with robust handling
    const updateData = { ...req.body };
    
    // Process single-value fields to extract first value from arrays
    const singleValueFields = [
      'title', 'slug', 'description', 'shortDescription', 'currentPrice', 
      'originalPrice', 'bestPrice', 'category', 'subCategory', 'brand', 
      'model', 'sku', 'displayOrder', 'isActive', 'isFeatured', 'isNew', 
      'stockQuantity', 'allowBackorder', 'material', 'careInstructions', 
      'metaTitle', 'metaDescription', 'thumbnailImageIndex'
    ];
    
    singleValueFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = extractFirstValue(req.body[field]);
      }
    });
    
    // Reuse the same parsing function from createProduct
    const parseArrayField = (field, isJson = false) => {
      if (!field) return [];
      
      // If it's already an array, handle it properly
      if (Array.isArray(field)) {
        // For array fields, if Postman sends an array, we need to flatten it
        if (isJson) {
          // For JSON fields, try to parse each item as JSON
          return field.flatMap(item => {
            if (typeof item === 'string') {
              try {
                return JSON.parse(item);
              } catch (error) {
                console.error('JSON parsing error for array item:', error);
                return [];
              }
            }
            return item;
          });
        } else {
          // For string arrays, split each item by comma and flatten
          return field.flatMap(item => {
            if (typeof item === 'string') {
              return item.split(',').map(subItem => subItem.trim()).filter(subItem => subItem.length > 0);
            }
            return item;
          });
        }
      }
      
      // If it's a string and should be JSON parsed
      if (isJson && typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (error) {
          console.error('JSON parsing error:', error);
          return [];
        }
      }
      
      // If it's a string, split by comma
      if (typeof field === 'string') {
        return field.split(',').map(item => item.trim()).filter(item => item.length > 0);
      }
      
      return [];
    };
    
    if (req.body.availableSizes) {
      updateData.availableSizes = parseArrayField(req.body.availableSizes);
    }
    
    if (req.body.availableColors) {
      updateData.availableColors = parseArrayField(req.body.availableColors, true);
    }
    
    if (req.body.labels) {
      updateData.labels = parseArrayField(req.body.labels);
    }
    
    if (req.body.tags) {
      updateData.tags = parseArrayField(req.body.tags);
    }
    
    if (req.body.keywords) {
      updateData.keywords = parseArrayField(req.body.keywords);
    }
    
    if (req.body.specifications) {
      updateData.specifications = parseArrayField(req.body.specifications, true);
    }
    
    // Handle thumbnail image update
    if (req.body.thumbnailImageIndex !== undefined && updatedImages.length > 0) {
      const index = parseInt(req.body.thumbnailImageIndex);
      if (index >= 0 && index < updatedImages.length) {
        updateData.thumbnailImage = {
          url: updatedImages[index].url,
          alt: updatedImages[index].alt
        };
      }
    }
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...updateData,
        images: updatedImages,
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
    
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can delete products.'
      });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await Product.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by category (Public)
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20, subCategory, labels, sortBy = 'displayOrder', sortOrder = 'asc' } = req.query;
    
    const query = { category, isActive: true };
    
    if (subCategory) {
      query.subCategory = subCategory;
    }
    
    if (labels) {
      query.labels = { $in: labels.split(',') };
    }
    
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: products,
      category,
      count: products.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get featured products (Public)
export const getFeaturedProducts = async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    
    const query = { isActive: true, isFeatured: true };
    
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
    
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get new products (Public)
export const getNewProducts = async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    
    const query = { isActive: true, isNew: true };
    
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
    
  } catch (error) {
    console.error('Get new products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by labels (Public)
export const getProductsByLabels = async (req, res) => {
  try {
    const { labels } = req.params;
    const { category, limit = 10 } = req.query;
    
    const query = { isActive: true, labels: { $in: labels.split(',') } };
    
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: products,
      labels: labels.split(','),
      count: products.length
    });
    
  } catch (error) {
    console.error('Get products by labels error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search products (Public)
export const searchProducts = async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    const { category, limit = 20, page = 1 } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    const query = {
      isActive: true,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { shortDescription: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    };
    
    if (category) {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: products,
      searchTerm,
      count: products.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product details for product page (Public)
export const getProductDetails = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await Product.findOne({ slug, isActive: true });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Increment view count
    await product.incrementView();
    
    res.status(200).json({
      success: true,
      data: product
    });
    
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get related products (Public)
export const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 4 } = req.query;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Find related products (same category, different subcategory, or same brand)
    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      isActive: true,
      $or: [
        { category: product.category },
        { brand: product.brand }
      ]
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: relatedProducts,
      count: relatedProducts.length
    });
    
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Increment click (Public)
export const incrementClick = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await product.incrementClick();
    
    res.status(200).json({
      success: true,
      message: 'Click recorded successfully'
    });
    
  } catch (error) {
    console.error('Increment click error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Increment impression (Public)
export const incrementImpression = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await product.incrementImpression();
    
    res.status(200).json({
      success: true,
      message: 'Impression recorded successfully'
    });
    
  } catch (error) {
    console.error('Increment impression error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product statistics (Admin)
export const getProductStats = async (req, res) => {
  try {
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can view statistics.'
      });
    }
    
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const featuredProducts = await Product.countDocuments({ isFeatured: true });
    const newProducts = await Product.countDocuments({ isNew: true });
    
    // Get category distribution
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get top performing products
    const topPerforming = await Product.find({ isActive: true })
      .sort({ clicks: -1, impressions: -1 })
      .limit(5)
      .select('title clicks impressions views sales');
    
    // Get low stock products
    const lowStockProducts = await Product.find({ 
      isActive: true, 
      stockQuantity: { $lte: 10 },
      stockQuantity: { $gt: 0 }
    })
      .sort({ stockQuantity: 1 })
      .limit(10)
      .select('title stockQuantity category');
    
    res.status(200).json({
      success: true,
      data: {
        total: totalProducts,
        active: activeProducts,
        featured: featuredProducts,
        new: newProducts,
        inactive: totalProducts - activeProducts,
        categoryDistribution: categoryStats,
        topPerforming,
        lowStockProducts
      }
    });
    
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get public products (Public - no auth required)
export const getPublicProducts = async (req, res) => {
  try {
    const { category, subCategory, limit = 20, page = 1, sortBy = 'displayOrder', sortOrder = 'asc' } = req.query;
    
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (subCategory) {
      query.subCategory = subCategory;
    }
    
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get public products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user products (Authenticated users - read only)
export const getUserProducts = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access products'
      });
    }

    const { category, subCategory, limit = 20, page = 1 } = req.query;
    
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (subCategory) {
      query.subCategory = subCategory;
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
