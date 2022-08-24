const user = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const path = require("path");
// const session = require("express-session");
const config = require("../config/config");

const randomstring = require("randomstring");



exports.securePassword = async(password)=>{
    try {

        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error);
        
    }
}

exports.sentverifyMail = async(name ,email ,user_id)=>{

    try {

       const transporter= nodemailer.createTransport({
           service: "Gmail",
           host: 'smtp.gmail.com',
           port: 587,
           secure: false,
           requireTLS: true,
           auth: {
               user: "bhoyaramit9404@gmail.com",
               pass: "amitniki"
           }
       });
        const mailOptions = {
            from : "bhoyaramit9404@gmail.com",
            to:email,
            subject:"For Verification Mail",
            html:'<p> hii '+name+',please copy the link And <a href="http://127.0.0.1:8000/user/verify?id='+user_id+'">Verifymail </a> your mail..</p>'

        }

        transporter.sendMail(mailOptions,function(error,info){

            if (error) {
                console.log(error);
            }
            else{
                console.log("Mail has been send ", info.response);
            }
        })

        
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
            html:'<p> hii '+name+',please copy the link And <a href="http://127.0.0.1:8000/user/forget-password?token='+token+'">Reset Your Password</a> your mail..</p>'

        }

        transporter.sendMail(mailOptions,function(error,info){

            if (error) {
                console.log(error);
            }
            else{
                console.log("Mail has been send ", info.response);
            }
        })

        
    } catch (error) {

        console.log(error);        
    }


}



exports.loadRegister = async(req,res)=>{
    try {
        res.render("registeration");

    } catch (error) {
        console.log(error);
        
    }
}


exports.insertUser = async(req,res)=>{
    try {

        const spassword = await this.securePassword(req.body.password);
        const User = new user({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            image: req.file.filename,
            password:spassword,
            is_admin:0
           // is_varified: req.body.is_varified

        });
//console.log(User);
        const userData =await User.save();
   
        console.log(userData);

if (userData) {
    
    this.sentverifyMail(req.body.name,req.body.email,userData._id);



    res.render('registeration',{message:"success"});
} else {
    res.render('registeration',{message:"failed"});

}

    } catch (error) {
        console.log(error.message);
        
    }
}

exports.verifyMail = async(req,res)=>{

    try {
        
     
        const updateinfo = await user.updateOne({_id:req.query.id},{ $set:{is_varified:1 } });
        console.log(updateinfo);
        res.render("email-varified")

    } catch (error) {

        console.log(error.message);
        
    }
}




// Login Fuction //

exports.loginload = async(req,res)=>{

    try {
        res.render("login");
    } catch (error) {
        console.log(error.message);
    }
}


exports.loadhome = async(req,res)=>{

    try {

     const userData = await user.findById({_id:req.session.user_id});
        res.render("home",{user:userData});
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

      const userData = await user.findOne({email:email});
      //console.log(userData);

      if (userData) {

        
  const passwordMatch = await bcrypt.compare(password,userData.password);
  //console.log(passwordMatch);

  if (passwordMatch) {

    if (userData.is_varified === 0) {
        console.log(userData.is_varified === 0);
        res.render("login",{message:"Please verify your mail"});

    } else {

        req.session.user_id = userData._id;
        res.redirect("home");
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

// Login Fuction //

exports.userLogout = async(req,res)=>{

    try {
        
        req.session.destroy();

        res.redirect("login");
    } catch (error) {
        console.log(error.message);

        
    }
}


exports.loadforget = async(req,res)=>{
    try {
        res.render("forget");
    } catch (error) {
        console.log(error.message);
    }
}


exports.forgetVerify = async(req,res)=>{
    try {

        const email =req.body.email;
        const userData =await user.findOne({email:email});
        
        if (userData) {
        // const randomString = randomstring.generate();

            if (userData.is_varified === 0) {
                res.render("forget",{message:"Please verify your email"});

                
            }
            else{

                const randomString = randomstring.generate();
              const updateData= await user.updateOne({email:email},{$set:{token:randomString }});
            this.sentResetPasswordMail(userData.name,userData.email,randomString);
            res.render("forget",{message:"Please Check your mail  and Reset your Password"});

            } 
            
        } 
        else {
            res.render("forget",{message:"User email is Incorrrect"});
        }

} catch (error) {
        console.log(error.message);
    }
}

exports.forgetPassword = async(req,res)=>{

    try {


        const token = req.query.token;
        const tokenData =await user.findOne({token:token}); 
        if (tokenData) {
            res.render("forget-password",{user_id:tokenData._id});

        } else {
            res.render("404",{message:"Token is Invalid"});
        }


    } catch (error) 
    {
    
        console.log(error.message);
  }

}


//  send verification mail link //

exports.verificationLoad = async(req,res)=>{

    try {
        res.render("verification");

    } catch (error) {
        console.log(error.message);

        
    }
}


exports.sendverificationLink = async(req,res)=>{

    try {

        const email = req.body.email;
      const userData =await user.findOne({email:email});

if (userData) {

    this.sentverifyMail(userData.name,userData.email,userData._id);
    res.render("verification",{message:"Reset verification mail sen your mail please check your mail.... "});


} else {
    res.render("verification",{message:"Please send correct email ..the mail not exits"});

}
        
    } catch (error) {
        console.log(error.message);

        
    }
}

//  send verification mail link //



// user Edit & Update //

exports.editload = async(req,res)=>{

    try {

      const id = req.query.id;
      const userData =await user.findById({_id:id});
      //console.log(userData);
      
      if (userData) {
       
        res.render("edituser",{user:userData});

      } else {

        res.redirect("/home");

        
      }

    } catch (error) {
        console.log(error.message);
    }
}


exports.updateProfile =  async(req,res)=>{
    
try {
  
    if (req.file) {

            const _id  = req.body.user_id;
            console.log(_id);
            const userData = await user.findByIdAndUpdate({_id:req.body.user_id} ,{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile,image:req.file.filename} });   
            console.log(userData);        
        
        }
     else 
     {

        // const _id  = req.body.user_id;
        // console.log(_id);
        const userData = await user.findByIdAndUpdate({_id:req.body.user_id },{$set:{name:req.body.name,email:req.body.email,mobile:req.body.mobile} }); 
        console.log(userData);
    }

    res.redirect("/user/home");

    }
    catch (error)
    {
        console.log(error.message);
    }
}

// user Edit & Update //
