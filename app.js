const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); 
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js"); 


app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, "/public")))  

const Mongo_URL="mongodb://127.0.0.1:27017/WonderVisit";

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

main()
 .then(()=>{
    console.log("connected to DB");
 }).catch((err)=>{
    console.log(err);
 });
async function main() {
    await mongoose.connect(Mongo_URL);
};

app.get("/",(req,res)=>{
    res.send("Hi, I am root");
});

const validateListing = (req,res,next)=>{
    let {error } = listingSchema.validate(req.body);
        if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg );
        }else{
            next();
        }
    };

const validateReview = (req,res,next)=>{
    let {error } = reviewsSchema.validate(req.body);
        if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg );
        }else{
            next();
        }
    };

//index route
app.get("/listings",async(req,res)=>{
    const allListings = (await Listing.find({})).map(normalizeListingImage);
    res.render("listings/index", { allListings });
    });

//new route
app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs");
});

//create route
app.post("/listings",validateListing,
    validateListing,
    wrapAsync(async (req, res, next) => {
        
        const { title, description, price, location, country, imageUrl } = req.body;
        const listingData = { title, description, price, location, country };
        listingData.image = { url: imageUrl || getImageUrlForTitle(title) };

        const listing = new Listing(listingData);
        await listing.save();
        res.redirect(`/listings/${listing._id}`);
    } 
    
));

//show route
app.get("/listings/:id", wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing}); 
}));

//edit route 
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update route
app.put("/listings/:id",validateListing,
     wrapAsync(async(req,res)=>{
      
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body});
    res.redirect(`/listings/${id}`);
}));

//Delete route
app.delete("/listings/:id", wrapAsync(async (req,res)=>{
    let {id}= req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));


//reviews
//post route
app.post("/listings/:id/reviews",validateReview,wrapAsync  (async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.Review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`)
})
    );

// app.get("/testListing", async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"My New Villa",
//         description:"By the Beach",
//         price:5000,
//         location:"Coorg",
//         country:"India"
//     });
//         await sampleListing.save();
//         console.log("sample was saved");
//         res.send("successfully tested");
//     });

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs",{err});
    // res.status(statusCode).send(message);
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080")
});