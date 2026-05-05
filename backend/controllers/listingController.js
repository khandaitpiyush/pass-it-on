import Listing from "../models/Listing.js";
import cloudinary from "../config/cloudinary.js";

/* ── Helper: upload a base64 data-URI to Cloudinary ── */
const uploadBase64ToCloudinary = (base64DataUri) => {
  return new Promise((resolve, reject) => {
    const base64Data = base64DataUri.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "passiton/listings",
        resource_type: "image",
        transformation: [
          { width: 1200, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
};

/* ---------------- CREATE LISTING ---------------- */
export const createListing = async (req, res) => {
  try {
    const user = req.user;

    if (!user.studentVerified) {
      return res.status(403).json({
        message: "Only verified campus students can sell items",
      });
    }

    const { title, description, price, category, condition, semester, image } = req.body;

    if (!image || !image.startsWith("data:image/")) {
      return res.status(400).json({ message: "A valid image is required." });
    }

    let imageUrl;
    try {
      const result = await uploadBase64ToCloudinary(image);
      imageUrl = result.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      return res.status(500).json({ message: "Image upload failed. Please try again." });
    }

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      condition,
      semester,
      image: imageUrl,
      seller: user._id,
      campusId: user.campusId,
    });

    res.status(201).json(listing);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Listing creation failed" });
  }
};

/* ---------------- GET CAMPUS LISTINGS ---------------- */
export const getListings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const query = { campusId: req.user.campusId };

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate("seller", "name studentVerified branch year")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments(query),
    ]);

    res.json({
      listings,
      total,
      page:       pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore:    pageNum < Math.ceil(total / limitNum),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fetching listings failed" });
  }
};

/* ---------------- GET SINGLE LISTING ---------------- */
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("seller", "name studentVerified branch year")
      .lean();

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.campusId.toString() !== req.user.campusId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
};

/* ---------------- DELETE LISTING ---------------- */
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (listing.image) {
      try {
        const urlParts  = listing.image.split("/");
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId  = `passiton/listings/${fileWithExt.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cleanupError) {
        console.warn("Cloudinary cleanup failed:", cleanupError.message);
      }
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete listing" });
  }
};