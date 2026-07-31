const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn} = require("../middleware.js");


//post review route
router.post("/", validateReview,isLoggedIn, wrapAsync(async(req,res)=>{
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);   // fixed
    newReview = new Review(req.body.review);
    console.log(newReview);
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();
    req.flash("success", "new review created");
    res.redirect(`/listings/${listing._id}`);
}));

//Delete review Route
router.delete("/:reviewId",
    wrapAsync(async (req,res) =>{
        let{id,reviewId}= req.params;
        await Listing.findByIdAndUpdate(id,{$pull: {reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review Deleted");
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;