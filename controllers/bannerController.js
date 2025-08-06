import Banner from '../models/Banner.js';
import { uploadImageToS3 } from '../utils/s3Upload.js';

// Create banner
export const createBanner = async (req, res) => {
  try {
    let bannerData = { ...req.body };
    
    // Handle image uploads if files are present
    if (req.files && req.files.length > 0) {
      try {
        const uploadedDesktopImages = [];
        const uploadedMobileImages = [];
        
        // Process all uploaded files
        for (const file of req.files) {
          if (file.fieldname === 'desktopImage' || file.fieldname === 'desktopImages') {
            const uploadedImage = await uploadImageToS3(file, 'banners/desktop');
            uploadedDesktopImages.push({
              url: uploadedImage.url,
              alt: uploadedImage.alt
            });
          } else if (file.fieldname === 'mobileImage' || file.fieldname === 'mobileImages') {
            const uploadedImage = await uploadImageToS3(file, 'banners/mobile');
            uploadedMobileImages.push({
              url: uploadedImage.url,
              alt: uploadedImage.alt
            });
          }
        }

        // Check if at least one image is uploaded for each type
        if (uploadedDesktopImages.length === 0 || uploadedMobileImages.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'At least one desktop and one mobile image are required'
          });
        }

        bannerData.desktopImages = uploadedDesktopImages;
        bannerData.mobileImages = uploadedMobileImages;

      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload banner images: ' + uploadError.message
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'At least one desktop and one mobile image are required'
      });
    }

    const banner = await Banner.create(bannerData);
    res.status(201).json({
      success: true,
      data: banner,
      message: 'Banner created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all banners
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1 });
    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single banner
export const getSingleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update banner
export const updateBanner = async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    // Handle new image uploads if files are present
    if (req.files && req.files.length > 0) {
      try {
        const uploadedDesktopImages = [];
        const uploadedMobileImages = [];
        
        // Process all uploaded files
        for (const file of req.files) {
          if (file.fieldname === 'desktopImage' || file.fieldname === 'desktopImages') {
            const uploadedImage = await uploadImageToS3(file, 'banners/desktop');
            uploadedDesktopImages.push({
              url: uploadedImage.url,
              alt: uploadedImage.alt
            });
          } else if (file.fieldname === 'mobileImage' || file.fieldname === 'mobileImages') {
            const uploadedImage = await uploadImageToS3(file, 'banners/mobile');
            uploadedMobileImages.push({
              url: uploadedImage.url,
              alt: uploadedImage.alt
            });
          }
        }

        // If images are uploaded, update them
        if (uploadedDesktopImages.length > 0) {
          updateData.desktopImages = uploadedDesktopImages;
        }
        if (uploadedMobileImages.length > 0) {
          updateData.mobileImages = uploadedMobileImages;
        }

        // If only one type of images is provided, require both
        if ((uploadedDesktopImages.length > 0 && uploadedMobileImages.length === 0) || 
            (uploadedDesktopImages.length === 0 && uploadedMobileImages.length > 0)) {
          return res.status(400).json({
            success: false,
            message: 'Both desktop and mobile images must be provided together'
          });
        }

      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload banner images: ' + uploadError.message
        });
      }
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: banner,
      message: 'Banner updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active banners for frontend
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ 
      isActive: true,
      isPublished: true 
    }).sort({ sortOrder: 1 });
    
    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active banners for desktop
export const getDesktopBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ 
      isActive: true,
      isPublished: true,
      'displayConditions.showOnDesktop': true
    }).sort({ sortOrder: 1 });
    
    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active banners for mobile
export const getMobileBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ 
      isActive: true,
      isPublished: true,
      'displayConditions.showOnMobile': true
    }).sort({ sortOrder: 1 });
    
    res.status(200).json({
      success: true,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 