const Listing = require("../models/listing");

module.exports.index = async(req,res) => {
    const allListings = (await Listing.find({})).map(normalizeListingImage);
    res.render("listings/index", { allListings });
    }