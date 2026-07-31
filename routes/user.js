const express = require("express");
const router = express.Router(); 
const User = require("../models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js")

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});

router.post("/signup", async(req,res)=>{
    try{
        let {username,email,password} = req.body;
    const newUser = new User({email,username});
    const registerUser = await User.register(newUser, password);
    console.log(registerUser);
    req.login(registerUser),(err) => {
        if(err){
            return next (err);
        }
        req.flash("success","Welcome to WonderVisit");
        res.redirect("/listings");
    };
    
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    };
});

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

router.post("/login", passport.authenticate("local",{failureRedirect: '/login', failureFlash:true}),
    async(req,res)=>{
    req.flash("success","Welcome back to WonderVisit !");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
});

router.get("/logout",(req,res) =>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out !");
        res.redirect("/listings");
    });
});

module.exports = router;