const { response } = require("express");
const Listing = require("../models/listing");
const geocodeLocation = require("../utils/geocode.js");

const fallbackImageUrl = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80";

function getImageUrlForTitle(title = "") {
    const normalizedTitle = title.toLowerCase();

    if (/(beach|coast|ocean|shore|sea|island|bali|greece|malibu|cancun)/i.test(normalizedTitle)) {
        return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
    }
    if (/(mountain|peak|alps|banff|rocky|ski|chalet|cabin|lake|forest|retreat)/i.test(normalizedTitle)) {
        return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80";
    }
    if (/(city|downtown|loft|penthouse|apartment|brownstone|urban|miami|boston|new york)/i.test(normalizedTitle)) {
        return "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80";
    }
    if (/(villa|luxury|castle|palace|historic|house|tuscany|phuket|dubai)/i.test(normalizedTitle)) {
        return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";
    }
    if (/(treehouse|nature|getaway|cottage|wood|rustic)/i.test(normalizedTitle)) {
        return "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80";
    }

    return fallbackImageUrl;
}

function normalizeListingImage(listing) {
    if (!listing.image) {
        listing.image = {};
    }

    if (!listing.image.url || listing.image.url.includes("wallpaperaccess")) {
        listing.image.url = getImageUrlForTitle(listing.title);
    }

    return listing;
}

module.exports.index = async(req,res) => {
    const { category, search } = req.query;
    let filter = {};

    if (category === "trending") {
        filter.views = { $gt: 5 };
    } else if (category) {
        filter.category = category;
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ];
    }

    const allListings = (await Listing.find(filter)).map(normalizeListingImage);
    res.render("listings/index", { allListings, category, search });
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = (async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate:{
            path: "author",
        }})
      .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    };
    console.log(listing);
    res.render("listings/show.ejs",{listing}); 
});

module.exports.createListing= async (req, res, next) => {
        const { title, description, price, location, country, category, imageUrl } = req.body;
        const listingData = { title, description, price, location, country, category };

        try {
            listingData.geometry = await geocodeLocation(location);
        } catch (err) {
            req.flash("error", "Please enter a valid location so the map can place your listing.");
            return res.redirect("/listings/new");
        }

        if (req.file) {
            const fileUrl = req.file.path || req.file.secure_url || req.file.url;
            listingData.image = {
                filename: req.file.filename || req.file.public_id,
                url: fileUrl || getImageUrlForTitle(title),
            };
        } else {
            listingData.image = { url: imageUrl || getImageUrlForTitle(title) };
        }

        const listing = new Listing(listingData);
        listing.owner = req.user._id;
        await listing.save();
        req.flash("success", "new listing created");
        res.redirect(`/listings/${listing._id}`);
    };


module.exports.renderEditForm =async (req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","listing you requested for does not exist");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    const { title, description, price, location, country, category, imageUrl } = req.body || {};
    const updateData = { title, description, price, location, country, category };

    try {
        updateData.geometry = await geocodeLocation(location);
    } catch (err) {
        req.flash("error", "Please enter a valid location so the map can place your listing.");
        return res.redirect(`/listings/${id}/edit`);
    }

    if (imageUrl) {
        updateData.image = { url: imageUrl };
    }
    if (req.file) {
        updateData.image = {
            url: req.file.path || req.file.secure_url || req.file.url,
            filename: req.file.filename || req.file.public_id,
        };
    }

    await Listing.findByIdAndUpdate(id, updateData);
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res)=>{
    let {id}= req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};