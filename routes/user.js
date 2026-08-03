const express = require("express");
const router = express.Router(); 
const User = require("../models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js")
const userController = require("../controllers/users.js");

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup))

router.route("/login")
    .get(userController.renderLoginForm)
    .post((req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash("error", info?.message || "Invalid username or password");
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome back to WonderVisit !");
            let redirectUrl = res.locals.redirectUrl || "/listings";
            return res.redirect(redirectUrl);
        });
    })(req, res, next);
});
router.get("/logout",userController.logout);

module.exports = router;