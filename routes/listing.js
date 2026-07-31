const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js")
const {listingSchema,reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js"); 
const {isLoggedIn, isOwner} = require("../middleware.js");

const uploadPath = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadPath,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const validateListing = (req,res,next)=>{
    let {error } = listingSchema.validate(req.body);
        if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg );
        }else{
            next();
        }
    };

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

//index route
router.get("/",async(req,res)=>{
    const allListings = (await Listing.find({})).map(normalizeListingImage);
    res.render("listings/index", { allListings });
    });

//new route
router.get("/new", isLoggedIn , (req,res)=>{
    res.render("listings/new.ejs");
});

//create route
router.post("/", isLoggedIn, upload.single("image"),
    validateListing,
    wrapAsync(async (req, res, next) => {
        
        const { title, description, price, location, country, imageUrl } = req.body;
        const listingData = { title, description, price, location, country };
        if (req.file) {
            listingData.image = { url: `/uploads/${req.file.filename}` };
        } else {
            listingData.image = { url: imageUrl || getImageUrlForTitle(title) };
        }

        const listing = new Listing(listingData);
        listing.owner = req.user._id;
        await listing.save();
        req.flash("success", "new listing created");
        res.redirect(`/listings/${listing._id}`);
    } 
    
));

//show route
router.get("/:id", wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    };
    console.log(listing);
    res.render("listings/show.ejs",{listing}); 
}));

//edit route 
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));

//update route
router.put("/:id", validateListing, isLoggedIn, isOwner,
     wrapAsync(async(req,res)=>{
      let {id} = req.params;
    const { title, description, price, location, country, imageUrl } = req.body;
    const updateData = { title, description, price, location, country };
    if (imageUrl) {
        updateData.image = { url: imageUrl };
    }
    await Listing.findByIdAndUpdate(id, updateData);
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

//Delete route
router.delete("/:id", isLoggedIn, wrapAsync(async (req,res)=>{
    let {id}= req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;