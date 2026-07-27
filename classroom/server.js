const express = require("express");
const app = express();
const users = require("./routes/user.js")
const users = require("./routes/post.js")
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(session({secret : "mysupersecretstring" , resave: false, saveUninitialized: true}));

app.get("/reqcount",(req,res) =>{
    if(req.session.count){
        req.session.count++;
    }else{
        req.session.count=1;
    }
    res.send(`you sent a request ${req.session.count} times`);
});

// app.get("/test",(req,res) =>{
//     res.send("test successful");
// });

app.listen(3000,()=>{
    console.log("Server is listening to 3000");
});