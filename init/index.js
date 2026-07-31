const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

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

const initDB = async()=>{
    await Listing.deleteMany({});
    const listingsToInsert = initData.data.map((obj) => ({ ...obj, owner: "6a6b88d8d4884fb71d9a95e8" }));
    await Listing.insertMany(listingsToInsert);
    console.log("data was initialized");
};

initDB();