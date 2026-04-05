import Listing from "../models/Listing.js";

/* ---------------- CREATE LISTING ---------------- */

export const createListing = async (req, res) => {
  try {
    const user = req.user;

    if (!user.studentVerified) {
      return res.status(403).json({
        message: "Only verified campus students can sell items"
      });
    }

    const { title, description, price, category, condition, semester, image } = req.body;

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      condition,
      semester,
      image,
      seller: user._id,
      campusId: user.campusId
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
    const user = req.user;

    const listings = await Listing.find({ campusId: user.campusId })
      .populate("seller", "name studentVerified branch year")
      .sort({ createdAt: -1 });

    res.json(listings);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fetching listings failed" });
  }
};

/* ---------------- GET SINGLE LISTING ---------------- */

export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("seller", "name studentVerified branch year");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Campus isolation — users can only view listings from their own campus
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

    await listing.deleteOne();
    res.json({ message: "Listing deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete listing" });
  }
};