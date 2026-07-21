const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js"); 
const Listing = require("./models/listing.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, "/public")))  

const Mongo_URL="mongodb://127.0.0.1:27017/WonderVisit";



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


app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);



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