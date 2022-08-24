const express = require("express");
const app =express();
require("./db");
const port = process.env.PORT || 8000;
const bodyParser = require("body-parser");
const path = require("path");




app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

//app.set('view engine', 'pug');
//app.set('views', './views');


require("./config/config");
app.set('views', './views/users');
//app.set('views', './views/admin');


// app.use("/admin",require("./routes/adminRoute"));
const user_route = require("./routes/userRoute");
app.use("/user",user_route);


const admin_route = require("./routes/adminRoute");
 app.use("/admin",admin_route);





// app.get("/login",async(req,res)=>{

//     res.render("login");

// });

// app.get("/register",async(req,res)=>{

//     res.render("register");

// });


// app.get("/user",async(req,res)=>{

//     res.render("registration");

// });



app.listen(port ,()=>{
    console.log(`connection is successful`);
});