const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const path = require("path");
const randomstring = require("randomstring");
const config = require("../config/config");
const nodemailer = require("nodemailer");


exports.loginLoad = async(req,res)=>{

    try {
        res.render("login")
    } catch (error) {
        console.log(error.message);
    }

}



exports.verifylogin = async(req,res)=>{

    try {

        const email = req.body.email;
        //console.log(email);
        const password = req.body.password;
        //console.log(password);

      const userData = await User.findOne({email:email});
      //console.log(userData);

      if (userData) {

        
  const passwordMatch = await bcrypt.compare(password,userData.password);
  //console.log(passwordMatch);

  if (passwordMatch) {

    if (userData.is_admin === 0) {
        console.log(userData.is_admin === 0);
        res.render("login",{message:"Please verify your mail"});

    } else {

        req.session.user_id = userData._id;
        res.redirect("/admin/home");
    }
  }
   else {
    res.render("login",{message:"email password inncorrect"});

    
  }
     
}
 else {
        res.render("login",{message:"email password inncorrect"});

      }


} catch (error) {
        console.log(error.message);
    }
}

// exports.verifylogin = async(req,res)=>{

// try {
    

// const email = req.body.email;
// const password = req.body.password;
// const userData =await User.findOne({email:email});
// //console.log(userData);

// if (userData) {
    
// const passwordMatch =await bcrypt.compare(password,userData.password);
// console.log(passwordMatch);


// if (passwordMatch) {

//     if (userData.is_admin === 0) {
//         console.log(userData.is_admin === 0);
       
//         res.render("login",{message:"Please verify your mail"});

//     } else {

//         req.session.user_id = userData._id;
//         res.redirect("/admin/home");
//     }
// }
//  else {
//     res.render("login",{message:"inccorect  and password"});
// }
// } 
// else {
//     res.render("login",{message:"inccorect  and password"});
// }

// } 
// catch (error) 
// {
//     console.log(error.message);
// }

// }


exports.loadDashboard= async(req,res)=>{

    try {

        const userData  = await User.findById({_id:req.session.user_id});
        res.render("home",{admin:userData});
    } catch (error) {
        console.log(error.message);
    }
}


exports.logout = async(req,res)=>{

    try {
        
        req.session.destroy();

        res.redirect("/admin");
    } catch (error) {
        console.log(error.message);

        
    }
}



exports.forgetLoad = async(req,res)=>{

    try {
        res.render("forget")
    } catch (error) {
        console.log(error.message);
    

}
}




exports.securePassword = async(password)=>{
    try {

        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error);
        
    }
}




// For Reset Password Send Email //

exports.sentResetPasswordMail = async(name ,email ,token)=>{

    try {

       const transporter= nodemailer.createTransport({
            host :'smtp.gmail.com',
            port:535,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        });
        const mailOptions = {
            from : config.emailUser,
            to:email,
            subject:"For Reset Password Send Mail",
            html:'<p> hii '+name+',please copy the link And <a href="http://127.0.0.1:8000/admin/forget-password?token='+token+'">Reset Your Password</a> your mail..</p>'

        }

        transporter.sendMail(mailOptions,function(error,info){

            if (error) {
                console.log(error);
            }
            else{
                console.log("Email has been send:-", info.response);
            }
        })

        
    } catch (error) {

        console.log(error);        
    }


}


// For Reset Password Send Email //


exports.forgetVerify = async(req,res)=>{
    try {

        const email =req.body.email;
        const userData =await User.findOne({email:email});
        
        if (userData) {

            if (userData.is_admin === 0) {

                res.render("forget",{message:" Email is Incorrect "});

            } else {
                
        const randomString = randomstring.generate();
        const updateData =await User.updateOne({email:email},{$set:{token:randomString}});
        this.sentResetPasswordMail(userData.name,userData.email,randomString);
        res.render("forget",{message:"Please Check Your Email And Reset Your Password"});

            }
            
        } 
        else {

            res.render("forget",{message:"Admin Email is Incorrect"});  
        }


} 
catch (error) {
        console.log(error.message);
    }
}



exports.forgetPasswordLoad = async(req,res)=>{

    try {
        const token  = req.query.token;
        const tokenData  =await User.findOne({token:token});

        if (tokenData) {
            res.render("forget-password",{user_id:tokenData._id});            
        } 
        else {
            res.render("404",{message:"Invalid Link"})
        }
    }
     catch (error) {
        console.log(error.message);
    }
}


exports.ResetPassword = async(req,res)=>{
    
    try {
        
        const password = req.body.password;
        const user_id = req.body.user_id;
        const securePass=await securePassword(password);
       const updateData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:securePass,token:""}});


       res.redirect("/admin");

    } catch (error) {
        console.log(error.message);

    }

}


exports.adminDashboard = async(req,res)=>{

    try {
        const userData  = await User.find({is_admin:0});

        res.render("dashboard",{users:userData});
    } catch (error) {
        console.log(error.message);

    }
}

