import TrendingCategory from '../../models/product/TrendingCategory.js';
import { uploadImageToS3 } from '../../utils/s3Upload.js';

// Create trending category (Admin only)
export const createTrendingCategory = async (req, res) => {
  try {
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can create trending categories.'
      });
    }

    const { name, slug, description, targetUrl, categoryType, displayOrder, isActive, isFeatured, tags, keywords } = req.body;
    
    // Check if slug already exists
    const existingCategory = await TrendingCategory.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this slug already exists'
      });
    }
    
    // Handle image upload
    let imageUrl = '';
    let imageAlt = '';
    
    if (req.file) {
      try {
        const uploadedImage = await uploadImageToS3(req.file, 'trending-categories');
        imageUrl = uploadedImage.url;
        imageAlt = req.body.imageAlt || `${name} category image`;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Category image is required'
      });
    }
    
    // Create trending category
    const trendingCategory = new TrendingCategory({
      name,
      slug,
      description,
      image: {
        url: imageUrl,
        alt: imageAlt
      },
      targetUrl,
      categoryType,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      keywords: keywords ? keywords.split(',').map(keyword => keyword.trim()) : [],
      createdBy: req.user._id
    });
    
    await trendingCategory.save();
    
    res.status(201).json({
      success: true,
      data: trendingCategory,
      message: 'Trending category created successfully by admin'
    });
    
  } catch (error) {
    console.error('Create trending category error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all trending categories (Admin)
export const getAllTrendingCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, categoryType, isActive, isFeatured } = req.query;
    
    const query = {};
    
    if (categoryType) query.categoryType = categoryType;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    
    const skip = (page - 1) * limit;
    
    const trendingCategories = await TrendingCategory.find(query)
      .populate('createdBy', 'name email')
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await TrendingCategory.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: trendingCategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get all trending categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single trending category by ID
export const getSingleTrendingCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trendingCategory = await TrendingCategory.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!trendingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Trending category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: trendingCategory
    });
    
  } catch (error) {
    console.error('Get single trending category error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update trending category (Admin)
export const updateTrendingCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can update trending categories.'
      });
    }
    
    const trendingCategory = await TrendingCategory.findById(id);
    
    if (!trendingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Trending category not found'
      });
    }
    
    // Handle image upload if provided
    let imageData = trendingCategory.image;
    
    if (req.file) {
      try {
        const uploadedImage = await uploadImageToS3(req.file, 'trending-categories');
        imageData = {
          url: uploadedImage.url,
          alt: req.body.imageAlt || trendingCategory.image.alt
        };
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image'
        });
      }
    }
    
    // Check if slug is being updated and if it already exists
    if (req.body.slug && req.body.slug !== trendingCategory.slug) {
      const existingCategory = await TrendingCategory.findOne({ slug: req.body.slug });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this slug already exists'
        });
      }
    }
    
    // Update trending category
    const updatedTrendingCategory = await TrendingCategory.findByIdAndUpdate(
      id,
      {
        ...req.body,
        image: imageData,
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      data: updatedTrendingCategory,
      message: 'Trending category updated successfully'
    });
    
  } catch (error) {
    console.error('Update trending category error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete trending category (Admin)
export const deleteTrendingCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can delete trending categories.'
      });
    }
    
    const trendingCategory = await TrendingCategory.findById(id);
    
    if (!trendingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Trending category not found'
      });
    }
    
    await TrendingCategory.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Trending category deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete trending category error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active trending categories (Public)
export const getActiveTrendingCategories = async (req, res) => {
  try {
    const { categoryType, limit = 10 } = req.query;
    
    const query = { isActive: true };
    
    if (categoryType) {
      query.categoryType = categoryType;
    }
    
    const trendingCategories = await TrendingCategory.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: trendingCategories,
      count: trendingCategories.length
    });
    
  } catch (error) {
    console.error('Get active trending categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get featured trending categories (Public)
export const getFeaturedTrendingCategories = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const trendingCategories = await TrendingCategory.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: trendingCategories,
      count: trendingCategories.length
    });
    
  } catch (error) {
    console.error('Get featured trending categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get trending categories by type (Public)
export const getTrendingCategoriesByType = async (req, res) => {
  try {
    const { categoryType } = req.params;
    const { limit = 10 } = req.query;
    
    const trendingCategories = await TrendingCategory.find({ 
      isActive: true, 
      categoryType: categoryType 
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: trendingCategories,
      categoryType,
      count: trendingCategories.length
    });
    
  } catch (error) {
    console.error('Get trending categories by type error:', error);
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
    
    const trendingCategory = await TrendingCategory.findById(id);
    
    if (!trendingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Trending category not found'
      });
    }
    
    await trendingCategory.incrementClick();
    
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
    
    const trendingCategory = await TrendingCategory.findById(id);
    
    if (!trendingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Trending category not found'
      });
    }
    
    await trendingCategory.incrementImpression();
    
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

// Get trending categories statistics (Admin)
export const getTrendingCategoriesStats = async (req, res) => {
  try {
    // Additional security check - ensure user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can view statistics.'
      });
    }
    
    const totalCategories = await TrendingCategory.countDocuments();
    const activeCategories = await TrendingCategory.countDocuments({ isActive: true });
    const featuredCategories = await TrendingCategory.countDocuments({ isFeatured: true });
    
    // Get category type distribution
    const categoryTypeStats = await TrendingCategory.aggregate([
      {
        $group: {
          _id: '$categoryType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get top performing categories
    const topPerforming = await TrendingCategory.find({ isActive: true })
      .sort({ clicks: -1, impressions: -1 })
      .limit(5)
      .select('name clicks impressions');
    
    res.status(200).json({
      success: true,
      data: {
        total: totalCategories,
        active: activeCategories,
        featured: featuredCategories,
        inactive: totalCategories - activeCategories,
        categoryTypeDistribution: categoryTypeStats,
        topPerforming
      }
    });
    
  } catch (error) {
    console.error('Get trending categories stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get public trending categories (Public - no auth required)
export const getPublicTrendingCategories = async (req, res) => {
  try {
    const { categoryType, limit = 10, page = 1 } = req.query;
    
    const query = { isActive: true };
    
    if (categoryType) {
      query.categoryType = categoryType;
    }
    
    const skip = (page - 1) * limit;
    
    const trendingCategories = await TrendingCategory.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await TrendingCategory.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: trendingCategories,
      count: trendingCategories.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get public trending categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user trending categories (Authenticated users - read only)
export const getUserTrendingCategories = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access trending categories'
      });
    }

    const { categoryType, limit = 10, page = 1 } = req.query;
    
    const query = { isActive: true };
    
    if (categoryType) {
      query.categoryType = categoryType;
    }
    
    const skip = (page - 1) * limit;
    
    const trendingCategories = await TrendingCategory.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await TrendingCategory.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: trendingCategories,
      count: trendingCategories.length,
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
    console.error('Get user trending categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user featured trending categories (Authenticated users - read only)
export const getUserFeaturedTrendingCategories = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access trending categories'
      });
    }

    const { limit = 6 } = req.query;
    
    const trendingCategories = await TrendingCategory.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: trendingCategories,
      count: trendingCategories.length,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
    
  } catch (error) {
    console.error('Get user featured trending categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user single trending category (Authenticated users - read only)
export const getUserSingleTrendingCategory = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access trending categories'
      });
    }

    const { id } = req.params;
    
    const trendingCategory = await TrendingCategory.findById(id);
    
    if (!trendingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Trending category not found'
      });
    }
    
    const trendingCategoryWithUser = {
      ...trendingCategory.toObject(),
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    };
    
    res.status(200).json({
      success: true,
      data: trendingCategoryWithUser
    });
    
  } catch (error) {
    console.error('Get user single trending category error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 