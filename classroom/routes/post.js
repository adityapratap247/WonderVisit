const express = require("express");
const router = express.Router();



//posts
// Index
router.get("/",(req,res) =>{
    res.send("get for users");
}); 

//show
router.get("/:id",(req,res) =>{
    res.send("get for users");
}); 

//post
router.post("/",(req,res) =>{
    res.send("post for users");
}); 

//delete
router.delete("/:id",(req,res) =>{
    res.send("delete for users");
}); 

router.listen(3000,()=>{
    console.log("Server is listening to 3000");
});