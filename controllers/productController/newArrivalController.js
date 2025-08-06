import NewArrival from '../../models/product/NewArrival.js';
import Product from '../../models/product/Product.js';
import { uploadImageToS3, uploadMultipleImagesToS3 } from '../../utils/s3Upload.js';

// Create new arrival (Admin only)
export const createNewArrival = async (req, res) => {
  try {
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can create new arrivals.'
      });
    }

    const { productId, ...newArrivalData } = req.body;
    
    let product = null;
    let folderName = 'new-arrivals/standalone';
    
    // Handle product reference if provided
    if (productId) {
      // Check if product exists and is active
      product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create new arrival for inactive product'
        });
      }
      
      // Check if product is already a new arrival
      const existingNewArrival = await NewArrival.findOne({ product: productId });
      if (existingNewArrival) {
        return res.status(400).json({
          success: false,
          message: 'Product is already marked as a new arrival'
        });
      }
      
      folderName = `new-arrivals/${productId}`;
    }
    
    // Validate display duration
    if (newArrivalData.displayDuration && (newArrivalData.displayDuration < 1 || newArrivalData.displayDuration > 365)) {
      return res.status(400).json({
        success: false,
        message: 'Display duration must be between 1 and 365 days'
      });
    }
    
    // Validate priority
    if (newArrivalData.priority && (newArrivalData.priority < 1 || newArrivalData.priority > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be between 1 and 10'
      });
    }
    
    // Handle image uploads
    let uploadedImages = [];
    let featuredImage = null;
    
    // Images are already validated by middleware, proceed with upload
    if (req.files && req.files.length > 0) {
      try {
        // Upload multiple images to S3
        const uploadPromises = req.files.map(async (file, index) => {
          const uploadedImage = await uploadImageToS3(file, folderName);
          
          return {
            url: uploadedImage.url,
            alt: req.body[`imageAlt_${index}`] || `New arrival image ${index + 1}`,
            type: req.body[`imageType_${index}`] || 'gallery',
            order: parseInt(req.body[`imageOrder_${index}`]) || index
          };
        });
        
        uploadedImages = await Promise.all(uploadPromises);
        
        // Featured image logic
        if (req.body.featuredImageIndex !== undefined && req.body.featuredImageIndex !== '') {
          // Use specified image as featured
          const featuredIndex = parseInt(req.body.featuredImageIndex);
          if (featuredIndex >= 0 && featuredIndex < uploadedImages.length) {
            featuredImage = {
              url: uploadedImages[featuredIndex].url,
              alt: uploadedImages[featuredIndex].alt || `Featured ${req.body.title || 'new arrival'} image`
            };
          }
        } else if (uploadedImages.length > 0) {
          // Default: Use first image as featured
          featuredImage = {
            url: uploadedImages[0].url,
            alt: uploadedImages[0].alt || `Featured ${req.body.title || 'new arrival'} image`
          };
        }
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: `Image upload failed: ${uploadError.message}`,
          error: 'UPLOAD_ERROR'
        });
      }
    }
    
    // Prepare new arrival data with product information
    const newArrivalDataToSave = {
      product: productId || null,
      // Product-specific fields
      title: newArrivalData.title || (product ? product.name : 'New Arrival Product'),
      description: newArrivalData.description || (product ? product.description : ''),
      currentPrice: newArrivalData.currentPrice || (product ? product.price : 0),
      originalPrice: newArrivalData.originalPrice || (product ? product.originalPrice || product.price : 0),
      discountPercentage: newArrivalData.discountPercentage,
      bestPrice: newArrivalData.bestPrice,
      brand: newArrivalData.brand || (product ? product.brand : ''),
      color: newArrivalData.color || (product ? product.color : ''),
      material: newArrivalData.material || (product ? product.material : ''),
      rating: newArrivalData.rating || (product ? product.rating : 0),
      numReviews: newArrivalData.numReviews || (product ? product.numReviews : 0),
      // Size configurations
      availableSizes: newArrivalData.availableSizes || [
        { size: 'S', stock: 10, isAvailable: true },
        { size: 'M', stock: 15, isAvailable: true },
        { size: 'L', stock: 12, isAvailable: true },
        { size: 'XL', stock: 8, isAvailable: true },
        { size: 'XXL', stock: 5, isAvailable: true }
      ],
      // New arrival specific fields
      ...newArrivalData,
      images: uploadedImages,
      featuredImage: featuredImage || req.body.featuredImageUrl ? {
        url: req.body.featuredImageUrl,
        alt: req.body.featuredImageAlt || 'Featured new arrival image'
      } : null,
      createdBy: req.user._id // Track who created it
    };

    // Create new arrival
    const newArrival = await NewArrival.create(newArrivalDataToSave);
    
    // Populate product details if product exists
    if (productId) {
      await newArrival.populate('product');
    }
    
    res.status(201).json({
      success: true,
      data: newArrival,
      message: 'New arrival created successfully by admin',
      imagesUploaded: uploadedImages.length,
      featuredImage: featuredImage,
      imageRequirements: {
        minimum: 3,
        maximum: 10,
        uploaded: uploadedImages.length
      },
      featuredImageInfo: {
        isSet: !!featuredImage,
        source: req.body.featuredImageIndex !== undefined ? 'specified' : 'default',
        index: req.body.featuredImageIndex || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all new arrivals (admin)
export const getAllNewArrivals = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'arrivalDate', sortOrder = 'desc' } = req.query;
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const newArrivals = await NewArrival.find({})
      .populate('product')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await NewArrival.countDocuments({});
    
    res.status(200).json({
      success: true,
      data: newArrivals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single new arrival
export const getSingleNewArrival = async (req, res) => {
  try {
    const newArrival = await NewArrival.findById(req.params.id).populate('product');
    
    if (!newArrival) {
      return res.status(404).json({
        success: false,
        message: 'New arrival not found'
      });
    }
    
    // Ensure featured image is set
    const newArrivalObj = newArrival.toObject();
    if (!newArrivalObj.featuredImage && newArrivalObj.images && newArrivalObj.images.length > 0) {
      newArrivalObj.featuredImage = {
        url: newArrivalObj.images[0].url,
        alt: newArrivalObj.images[0].alt || `Featured ${newArrivalObj.title} image`
      };
    }
    
    res.status(200).json({
      success: true,
      data: newArrivalObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update new arrival
export const updateNewArrival = async (req, res) => {
  try {
    const newArrival = await NewArrival.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('product');
    
    if (!newArrival) {
      return res.status(404).json({
        success: false,
        message: 'New arrival not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: newArrival,
      message: 'New arrival updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete new arrival
export const deleteNewArrival = async (req, res) => {
  try {
    const newArrival = await NewArrival.findByIdAndDelete(req.params.id);
    
    if (!newArrival) {
      return res.status(404).json({
        success: false,
        message: 'New arrival not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'New arrival deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active new arrivals for frontend (public)
export const getActiveNewArrivals = async (req, res) => {
  try {
    const { deviceType = 'desktop', limit = 10, category } = req.query;
    
    let query = {
      isActive: true
    };
    
    // Add device type filter
    if (deviceType === 'mobile') {
      query['displayConditions.showOnMobile'] = true;
    } else {
      query['displayConditions.showOnDesktop'] = true;
    }
    
    // Add category filter if provided
    if (category) {
      query['product.category'] = category;
    }
    
    // Get current date for expiry check
    const now = new Date();
    
    const newArrivals = await NewArrival.find(query)
      .populate({
        path: 'product',
        match: { isActive: true } // Only include active products
      })
      .sort({ displayOrder: 1, priority: -1, arrivalDate: -1 })
      .limit(parseInt(limit));
    
    // Filter out expired new arrivals and products that don't exist
    const validNewArrivals = newArrivals.filter(newArrival => {
      if (!newArrival.product) return false; // Product doesn't exist
      
      const expiryDate = newArrival.expiryDate || 
        new Date(newArrival.arrivalDate.getTime() + (newArrival.displayDuration * 24 * 60 * 60 * 1000));
      
      return now <= expiryDate;
    });
    
    // Add featured image info to each new arrival
    const newArrivalsWithFeatured = validNewArrivals.map(newArrival => {
      const newArrivalObj = newArrival.toObject();
      
      // Ensure featured image is set
      if (!newArrivalObj.featuredImage && newArrivalObj.images && newArrivalObj.images.length > 0) {
        newArrivalObj.featuredImage = {
          url: newArrivalObj.images[0].url,
          alt: newArrivalObj.images[0].alt || `Featured ${newArrivalObj.title} image`
        };
      }
      
      return newArrivalObj;
    });
    
    res.status(200).json({
      success: true,
      data: newArrivalsWithFeatured,
      count: newArrivalsWithFeatured.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get featured new arrivals
export const getFeaturedNewArrivals = async (req, res) => {
  try {
    const { deviceType = 'desktop', limit = 5 } = req.query;
    
    let query = {
      isActive: true,
      isFeatured: true
    };
    
    // Add device type filter
    if (deviceType === 'mobile') {
      query['displayConditions.showOnMobile'] = true;
    } else {
      query['displayConditions.showOnDesktop'] = true;
    }
    
    const now = new Date();
    
    const featuredNewArrivals = await NewArrival.find(query)
      .populate({
        path: 'product',
        match: { isActive: true }
      })
      .sort({ priority: -1, displayOrder: 1, arrivalDate: -1 })
      .limit(parseInt(limit));
    
    // Filter out expired and invalid entries
    const validFeaturedNewArrivals = featuredNewArrivals.filter(newArrival => {
      if (!newArrival.product) return false;
      
      const expiryDate = newArrival.expiryDate || 
        new Date(newArrival.arrivalDate.getTime() + (newArrival.displayDuration * 24 * 60 * 60 * 1000));
      
      return now <= expiryDate;
    });
    
    // Add featured image info to each new arrival
    const featuredNewArrivalsWithFeatured = validFeaturedNewArrivals.map(newArrival => {
      const newArrivalObj = newArrival.toObject();
      
      // Ensure featured image is set
      if (!newArrivalObj.featuredImage && newArrivalObj.images && newArrivalObj.images.length > 0) {
        newArrivalObj.featuredImage = {
          url: newArrivalObj.images[0].url,
          alt: newArrivalObj.images[0].alt || `Featured ${newArrivalObj.title} image`
        };
      }
      
      return newArrivalObj;
    });
    
    res.status(200).json({
      success: true,
      data: featuredNewArrivalsWithFeatured,
      count: featuredNewArrivalsWithFeatured.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get new arrivals by category
export const getNewArrivalsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { deviceType = 'desktop', limit = 10 } = req.query;
    
    let query = {
      isActive: true
    };
    
    // Add device type filter
    if (deviceType === 'mobile') {
      query['displayConditions.showOnMobile'] = true;
    } else {
      query['displayConditions.showOnDesktop'] = true;
    }
    
    const now = new Date();
    
    const newArrivals = await NewArrival.find(query)
      .populate({
        path: 'product',
        match: { 
          isActive: true,
          category: category
        }
      })
      .sort({ displayOrder: 1, priority: -1, arrivalDate: -1 })
      .limit(parseInt(limit));
    
    // Filter out expired and invalid entries
    const validNewArrivals = newArrivals.filter(newArrival => {
      if (!newArrival.product) return false;
      
      const expiryDate = newArrival.expiryDate || 
        new Date(newArrival.arrivalDate.getTime() + (newArrival.displayDuration * 24 * 60 * 60 * 1000));
      
      return now <= expiryDate;
    });
    
    res.status(200).json({
      success: true,
      data: validNewArrivals,
      count: validNewArrivals.length,
      category: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Increment impression (for analytics)
export const incrementImpression = async (req, res) => {
  try {
    const newArrival = await NewArrival.findById(req.params.id);
    
    if (!newArrival) {
      return res.status(404).json({
        success: false,
        message: 'New arrival not found'
      });
    }
    
    await newArrival.incrementImpression();
    
    res.status(200).json({
      success: true,
      message: 'Impression recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Increment click (for analytics)
export const incrementClick = async (req, res) => {
  try {
    const newArrival = await NewArrival.findById(req.params.id);
    
    if (!newArrival) {
      return res.status(404).json({
        success: false,
        message: 'New arrival not found'
      });
    }
    
    await newArrival.incrementClick();
    
    res.status(200).json({
      success: true,
      message: 'Click recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Bulk operations
export const bulkUpdateNewArrivals = async (req, res) => {
  try {
    const { newArrivals } = req.body;
    
    if (!Array.isArray(newArrivals)) {
      return res.status(400).json({
        success: false,
        message: 'newArrivals must be an array'
      });
    }
    
    const updatePromises = newArrivals.map(async (item) => {
      const { id, ...updateData } = item;
      return NewArrival.findByIdAndUpdate(id, updateData, { new: true }).populate('product');
    });
    
    const updatedNewArrivals = await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      data: updatedNewArrivals,
      message: 'New arrivals updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get new arrivals statistics
export const getNewArrivalsStats = async (req, res) => {
  try {
    const totalNewArrivals = await NewArrival.countDocuments({});
    const activeNewArrivals = await NewArrival.countDocuments({ isActive: true });
    const featuredNewArrivals = await NewArrival.countDocuments({ isActive: true, isFeatured: true });
    
    // Get expired new arrivals
    const now = new Date();
    const expiredNewArrivals = await NewArrival.countDocuments({
      $or: [
        { expiryDate: { $lt: now } },
        {
          $expr: {
            $lt: [
              { $add: ['$arrivalDate', { $multiply: ['$displayDuration', 24 * 60 * 60 * 1000] }] },
              now
            ]
          }
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: {
        total: totalNewArrivals,
        active: activeNewArrivals,
        featured: featuredNewArrivals,
        expired: expiredNewArrivals
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 

// Get all new arrivals (public - no auth required)
export const getPublicNewArrivals = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'arrivalDate', sortOrder = 'desc', category } = req.query;
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    let query = { isActive: true };
    
    // Add category filter if provided
    if (category) {
      query['product.category'] = category;
    }
    
    // Get current date for expiry check
    const now = new Date();
    
    const newArrivals = await NewArrival.find(query)
      .populate('product')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Filter out expired new arrivals only
    const validNewArrivals = newArrivals.filter(newArrival => {
      const expiryDate = newArrival.expiryDate || 
        new Date(newArrival.arrivalDate.getTime() + (newArrival.displayDuration * 24 * 60 * 60 * 1000));
      
      return now <= expiryDate;
    });
    
    // Add featured image info to each new arrival
    const newArrivalsWithFeatured = validNewArrivals.map(newArrival => {
      const newArrivalObj = newArrival.toObject();
      
      // Ensure featured image is set
      if (!newArrivalObj.featuredImage && newArrivalObj.images && newArrivalObj.images.length > 0) {
        newArrivalObj.featuredImage = {
          url: newArrivalObj.images[0].url,
          alt: newArrivalObj.images[0].alt || `Featured ${newArrivalObj.title} image`
        };
      }
      
      return newArrivalObj;
    });
    
    const total = await NewArrival.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: newArrivalsWithFeatured,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 