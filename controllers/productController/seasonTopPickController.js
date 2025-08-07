import SeasonTopPick from '../../models/product/SeasonTopPick.js';
import Product from '../../models/product/Product.js';
import { uploadImageToS3, uploadMultipleImagesToS3 } from '../../utils/s3Upload.js';

// Create season top pick (Admin only)
export const createSeasonTopPick = async (req, res) => {
  try {
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can create season top picks.'
      });
    }

    const { productId, ...seasonTopPickData } = req.body;
    
    let product = null;
    let folderName = 'season-top-picks/standalone';
    
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
          message: 'Cannot create season top pick for inactive product'
        });
      }
      
      // Check if product is already a season top pick
      const existingSeasonTopPick = await SeasonTopPick.findOne({ product: productId });
      if (existingSeasonTopPick) {
        return res.status(400).json({
          success: false,
          message: 'Product is already marked as a season top pick'
        });
      }
      
      folderName = `season-top-picks/${productId}`;
    }
    
    // Validate priority
    if (seasonTopPickData.priority && (seasonTopPickData.priority < 1 || seasonTopPickData.priority > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be between 1 and 10'
      });
    }
    
    // Handle image uploads
    let uploadedImages = [];
    let featuredImage = null;
    
    // Use the combined files from middleware
    const allFiles = req.allFiles || [];
    
    if (allFiles.length > 0) {
      try {
        // Upload multiple images to S3
        const uploadPromises = allFiles.map(async (file, index) => {
          const uploadedImage = await uploadImageToS3(file, folderName);
          
          return {
            url: uploadedImage.url,
            alt: req.body[`imageAlt_${index}`] || `Season top pick image ${index + 1}`,
            type: req.body[`imageType_${index}`] || 'gallery',
            order: parseInt(req.body[`imageOrder_${index}`]) || index
          };
        });
        
        uploadedImages = await Promise.all(uploadPromises);
        
        // Featured image logic - check if featuredImage was uploaded separately
        if (req.files && req.files.featuredImage && req.files.featuredImage.length > 0) {
          // Use the separately uploaded featured image
          const featuredUploadedImage = await uploadImageToS3(req.files.featuredImage[0], folderName);
          featuredImage = {
            url: featuredUploadedImage.url,
            alt: req.body.featuredImageAlt || `Featured ${req.body.title || 'season top pick'} image`
          };
        } else if (req.body.featuredImageIndex !== undefined && req.body.featuredImageIndex !== '') {
          // Use specified image as featured
          const featuredIndex = parseInt(req.body.featuredImageIndex);
          if (featuredIndex >= 0 && featuredIndex < uploadedImages.length) {
            featuredImage = {
              url: uploadedImages[featuredIndex].url,
              alt: uploadedImages[featuredIndex].alt || `Featured ${req.body.title || 'season top pick'} image`
            };
          }
        } else if (uploadedImages.length > 0) {
          // Default: Use first image as featured
          featuredImage = {
            url: uploadedImages[0].url,
            alt: uploadedImages[0].alt || `Featured ${req.body.title || 'season top pick'} image`
          };
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images'
        });
      }
    }
    
    // Create season top pick
    const seasonTopPick = new SeasonTopPick({
      ...seasonTopPickData,
      product: productId,
      images: uploadedImages,
      featuredImage,
      createdBy: req.user._id
    });
    
    await seasonTopPick.save();
    
    res.status(201).json({
      success: true,
      data: seasonTopPick,
      message: 'Season top pick created successfully by admin',
      imagesUploaded: uploadedImages.length,
      featuredImage: featuredImage,
      imageRequirements: {
        minimum: 1,
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
    console.error('Create season top pick error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all season top picks (Admin)
export const getAllSeasonTopPicks = async (req, res) => {
  try {
    const { page = 1, limit = 10, season, category, isActive, isFeatured } = req.query;
    
    const query = {};
    
    if (season) query.season = season;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    
    const skip = (page - 1) * limit;
    
    const seasonTopPicks = await SeasonTopPick.find(query)
      .populate('product', 'name price images')
      .populate('createdBy', 'name email')
      .sort({ priority: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await SeasonTopPick.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: seasonTopPicks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get all season top picks error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single season top pick by ID
export const getSingleSeasonTopPick = async (req, res) => {
  try {
    const { id } = req.params;
    
    const seasonTopPick = await SeasonTopPick.findById(id)
      .populate('product', 'name price images description')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!seasonTopPick) {
      return res.status(404).json({
        success: false,
        message: 'Season top pick not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: seasonTopPick
    });
    
  } catch (error) {
    console.error('Get single season top pick error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update season top pick (Admin)
export const updateSeasonTopPick = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can update season top picks.'
      });
    }
    
    const seasonTopPick = await SeasonTopPick.findById(id);
    
    if (!seasonTopPick) {
      return res.status(404).json({
        success: false,
        message: 'Season top pick not found'
      });
    }
    
    // Handle image uploads if provided
    let uploadedImages = seasonTopPick.images || [];
    let featuredImage = seasonTopPick.featuredImage;
    
    // Use the combined files from middleware
    const allFiles = req.allFiles || [];
    
    if (allFiles.length > 0) {
      try {
        const folderName = seasonTopPick.product 
          ? `season-top-picks/${seasonTopPick.product}` 
          : 'season-top-picks/standalone';
        
        // Upload new images
        const uploadPromises = allFiles.map(async (file, index) => {
          const uploadedImage = await uploadImageToS3(file, folderName);
          
          return {
            url: uploadedImage.url,
            alt: req.body[`imageAlt_${index}`] || `Season top pick image ${index + 1}`,
            type: req.body[`imageType_${index}`] || 'gallery',
            order: parseInt(req.body[`imageOrder_${index}`]) || index
          };
        });
        
        const newImages = await Promise.all(uploadPromises);
        uploadedImages = [...uploadedImages, ...newImages];
        
        // Featured image logic - check if featuredImage was uploaded separately
        if (req.files && req.files.featuredImage && req.files.featuredImage.length > 0) {
          // Use the separately uploaded featured image
          const featuredUploadedImage = await uploadImageToS3(req.files.featuredImage[0], folderName);
          featuredImage = {
            url: featuredUploadedImage.url,
            alt: req.body.featuredImageAlt || `Featured ${req.body.title || 'season top pick'} image`
          };
        } else if (req.body.featuredImageIndex !== undefined && req.body.featuredImageIndex !== '') {
          // Use specified image as featured
          const featuredIndex = parseInt(req.body.featuredImageIndex);
          if (featuredIndex >= 0 && featuredIndex < uploadedImages.length) {
            featuredImage = {
              url: uploadedImages[featuredIndex].url,
              alt: uploadedImages[featuredIndex].alt || `Featured ${req.body.title || 'season top pick'} image`
            };
          }
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images'
        });
      }
    }
    
    // Update season top pick
    const updatedSeasonTopPick = await SeasonTopPick.findByIdAndUpdate(
      id,
      {
        ...req.body,
        images: uploadedImages,
        featuredImage,
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    ).populate('product', 'name price images');
    
    res.status(200).json({
      success: true,
      data: updatedSeasonTopPick,
      message: 'Season top pick updated successfully'
    });
    
  } catch (error) {
    console.error('Update season top pick error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete season top pick (Admin)
export const deleteSeasonTopPick = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can delete season top picks.'
      });
    }
    
    const seasonTopPick = await SeasonTopPick.findById(id);
    
    if (!seasonTopPick) {
      return res.status(404).json({
        success: false,
        message: 'Season top pick not found'
      });
    }
    
    await SeasonTopPick.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Season top pick deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete season top pick error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active season top picks (Public)
export const getActiveSeasonTopPicks = async (req, res) => {
  try {
    const { season, category, limit = 10, page = 1 } = req.query;
    
    const query = { isActive: true };
    
    if (season && season !== 'All Season') {
      query.season = season;
    }
    
    if (category) {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const seasonTopPicks = await SeasonTopPick.find(query)
      .populate('product', 'name price images')
      .sort({ priority: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Add featured image to each season top pick
    const seasonTopPicksWithFeaturedImage = seasonTopPicks.map(pick => ({
      ...pick.toObject(),
      featuredImage: pick.featuredImage || (pick.images && pick.images.length > 0 ? pick.images[0] : null)
    }));
    
    const total = await SeasonTopPick.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: seasonTopPicksWithFeaturedImage,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get active season top picks error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get featured season top picks (Public)
export const getFeaturedSeasonTopPicks = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const seasonTopPicks = await SeasonTopPick.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('product', 'name price images')
      .sort({ priority: -1, displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));
    
    // Add featured image to each season top pick
    const seasonTopPicksWithFeaturedImage = seasonTopPicks.map(pick => ({
      ...pick.toObject(),
      featuredImage: pick.featuredImage || (pick.images && pick.images.length > 0 ? pick.images[0] : null)
    }));
    
    res.status(200).json({
      success: true,
      data: seasonTopPicksWithFeaturedImage,
      count: seasonTopPicksWithFeaturedImage.length
    });
    
  } catch (error) {
    console.error('Get featured season top picks error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get season top picks by category (Public)
export const getSeasonTopPicksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { season, limit = 10, page = 1 } = req.query;
    
    const query = { 
      isActive: true, 
      category: category 
    };
    
    if (season && season !== 'All Season') {
      query.season = season;
    }
    
    const skip = (page - 1) * limit;
    
    const seasonTopPicks = await SeasonTopPick.find(query)
      .populate('product', 'name price images')
      .sort({ priority: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Add featured image to each season top pick
    const seasonTopPicksWithFeaturedImage = seasonTopPicks.map(pick => ({
      ...pick.toObject(),
      featuredImage: pick.featuredImage || (pick.images && pick.images.length > 0 ? pick.images[0] : null)
    }));
    
    const total = await SeasonTopPick.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: seasonTopPicksWithFeaturedImage,
      category,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get season top picks by category error:', error);
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
    
    const seasonTopPick = await SeasonTopPick.findById(id);
    
    if (!seasonTopPick) {
      return res.status(404).json({
        success: false,
        message: 'Season top pick not found'
      });
    }
    
    await seasonTopPick.incrementImpression();
    
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

// Increment click (Public)
export const incrementClick = async (req, res) => {
  try {
    const { id } = req.params;
    
    const seasonTopPick = await SeasonTopPick.findById(id);
    
    if (!seasonTopPick) {
      return res.status(404).json({
        success: false,
        message: 'Season top pick not found'
      });
    }
    
    await seasonTopPick.incrementClick();
    
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

// Bulk update season top picks (Admin)
export const bulkUpdateSeasonTopPicks = async (req, res) => {
  try {
    const { updates } = req.body;
    
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can perform bulk updates.'
      });
    }
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required'
      });
    }
    
    const results = [];
    
    for (const update of updates) {
      const { id, ...updateData } = update;
      
      try {
        const updatedSeasonTopPick = await SeasonTopPick.findByIdAndUpdate(
          id,
          { ...updateData, updatedBy: req.user._id },
          { new: true, runValidators: true }
        );
        
        if (updatedSeasonTopPick) {
          results.push({
            id,
            success: true,
            data: updatedSeasonTopPick
          });
        } else {
          results.push({
            id,
            success: false,
            message: 'Season top pick not found'
          });
        }
      } catch (error) {
        results.push({
          id,
          success: false,
          message: error.message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      results,
      totalProcessed: results.length
    });
    
  } catch (error) {
    console.error('Bulk update season top picks error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get season top picks statistics (Admin)
export const getSeasonTopPicksStats = async (req, res) => {
  try {
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can view statistics.'
      });
    }
    
    const totalSeasonTopPicks = await SeasonTopPick.countDocuments();
    const activeSeasonTopPicks = await SeasonTopPick.countDocuments({ isActive: true });
    const featuredSeasonTopPicks = await SeasonTopPick.countDocuments({ isFeatured: true });
    
    // Get season distribution
    const seasonStats = await SeasonTopPick.aggregate([
      {
        $group: {
          _id: '$season',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get category distribution
    const categoryStats = await SeasonTopPick.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get top performing season top picks
    const topPerforming = await SeasonTopPick.find({ isActive: true })
      .sort({ clicks: -1, impressions: -1 })
      .limit(5)
      .select('title clicks impressions conversions');
    
    res.status(200).json({
      success: true,
      data: {
        total: totalSeasonTopPicks,
        active: activeSeasonTopPicks,
        featured: featuredSeasonTopPicks,
        inactive: totalSeasonTopPicks - activeSeasonTopPicks,
        seasonDistribution: seasonStats,
        categoryDistribution: categoryStats,
        topPerforming
      }
    });
    
  } catch (error) {
    console.error('Get season top picks stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get public season top picks (Public - no auth required)
export const getPublicSeasonTopPicks = async (req, res) => {
  try {
    const { season, category, limit = 10, page = 1 } = req.query;
    
    const query = { isActive: true };
    
    if (season && season !== 'All Season') {
      query.season = season;
    }
    
    if (category) {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const seasonTopPicks = await SeasonTopPick.find(query)
      .populate('product', 'name price images')
      .sort({ priority: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Add featured image to each season top pick
    const seasonTopPicksWithFeaturedImage = seasonTopPicks.map(pick => ({
      ...pick.toObject(),
      featuredImage: pick.featuredImage || (pick.images && pick.images.length > 0 ? pick.images[0] : null)
    }));
    
    const total = await SeasonTopPick.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: seasonTopPicksWithFeaturedImage,
      count: seasonTopPicksWithFeaturedImage.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get public season top picks error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user season top picks (Authenticated users - read only)
export const getUserSeasonTopPicks = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access season top picks'
      });
    }

    const { season, category, limit = 10, page = 1 } = req.query;
    
    const query = { isActive: true };
    
    if (season && season !== 'All Season') {
      query.season = season;
    }
    
    if (category) {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const seasonTopPicks = await SeasonTopPick.find(query)
      .populate('product', 'name price images')
      .sort({ priority: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Add featured image to each season top pick
    const seasonTopPicksWithFeaturedImage = seasonTopPicks.map(pick => ({
      ...pick.toObject(),
      featuredImage: pick.featuredImage || (pick.images && pick.images.length > 0 ? pick.images[0] : null)
    }));
    
    const total = await SeasonTopPick.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: seasonTopPicksWithFeaturedImage,
      count: seasonTopPicksWithFeaturedImage.length,
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
    console.error('Get user season top picks error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user active season top picks (Authenticated users - read only)
export const getUserActiveSeasonTopPicks = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access season top picks'
      });
    }

    const { season, category, limit = 10, page = 1 } = req.query;
    
    const query = { isActive: true };
    
    if (season && season !== 'All Season') {
      query.season = season;
    }
    
    if (category) {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const seasonTopPicks = await SeasonTopPick.find(query)
      .populate('product', 'name price images')
      .sort({ priority: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Add featured image to each season top pick
    const seasonTopPicksWithFeaturedImage = seasonTopPicks.map(pick => ({
      ...pick.toObject(),
      featuredImage: pick.featuredImage || (pick.images && pick.images.length > 0 ? pick.images[0] : null)
    }));
    
    const total = await SeasonTopPick.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: seasonTopPicksWithFeaturedImage,
      count: seasonTopPicksWithFeaturedImage.length,
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
    console.error('Get user active season top picks error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user featured season top picks (Authenticated users - read only)
export const getUserFeaturedSeasonTopPicks = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access season top picks'
      });
    }

    const { limit = 6 } = req.query;
    
    const seasonTopPicks = await SeasonTopPick.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('product', 'name price images')
      .sort({ priority: -1, displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));
    
    // Add featured image to each season top pick
    const seasonTopPicksWithFeaturedImage = seasonTopPicks.map(pick => ({
      ...pick.toObject(),
      featuredImage: pick.featuredImage || (pick.images && pick.images.length > 0 ? pick.images[0] : null)
    }));
    
    res.status(200).json({
      success: true,
      data: seasonTopPicksWithFeaturedImage,
      count: seasonTopPicksWithFeaturedImage.length,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
    
  } catch (error) {
    console.error('Get user featured season top picks error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user season top picks by category (Authenticated users - read only)
export const getUserSeasonTopPicksByCategory = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access season top picks'
      });
    }

    const { category } = req.params;
    const { season, limit = 10, page = 1 } = req.query;
    
    const query = { 
      isActive: true, 
      category: category 
    };
    
    if (season && season !== 'All Season') {
      query.season = season;
    }
    
    const skip = (page - 1) * limit;
    
    const seasonTopPicks = await SeasonTopPick.find(query)
      .populate('product', 'name price images')
      .sort({ priority: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Add featured image to each season top pick
    const seasonTopPicksWithFeaturedImage = seasonTopPicks.map(pick => ({
      ...pick.toObject(),
      featuredImage: pick.featuredImage || (pick.images && pick.images.length > 0 ? pick.images[0] : null)
    }));
    
    const total = await SeasonTopPick.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: seasonTopPicksWithFeaturedImage,
      category,
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
    console.error('Get user season top picks by category error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user single season top pick (Authenticated users - read only)
export const getUserSingleSeasonTopPick = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access season top picks'
      });
    }

    const { id } = req.params;
    
    const seasonTopPick = await SeasonTopPick.findById(id)
      .populate('product', 'name price images description');
    
    if (!seasonTopPick) {
      return res.status(404).json({
        success: false,
        message: 'Season top pick not found'
      });
    }
    
    // Add featured image
    const seasonTopPickWithFeaturedImage = {
      ...seasonTopPick.toObject(),
      featuredImage: seasonTopPick.featuredImage || (seasonTopPick.images && seasonTopPick.images.length > 0 ? seasonTopPick.images[0] : null),
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    };
    
    res.status(200).json({
      success: true,
      data: seasonTopPickWithFeaturedImage
    });
    
  } catch (error) {
    console.error('Get user single season top pick error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 