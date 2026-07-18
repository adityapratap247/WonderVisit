const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        
    },
    image: {
        filename: { type: String, default: "" },
        url: { type: String, default: "https://wallpaperaccess.com/4k-ultra-high-resolution-nature" }
    },
    price:Number,
    location:String,
    country:String,
    reviews: [
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        }
    ]
});

const Listing = mongoose.model("listing",listingSchema);
module.exports = Listing;