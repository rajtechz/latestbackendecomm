import Banner from "../../models/admin/Banner.js";
import { uploadToS3 } from "../../config/s3.js"; 

export const createBanner = async (req, res) => {
  try {
    const { title, link } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No image uploaded" });

    const imageUrl = await uploadToS3(file); // returns public S3 URL

    const banner = new Banner({ title, imageUrl, link });
    await banner.save();

    res.status(201).json({ message: "Banner created", banner });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
