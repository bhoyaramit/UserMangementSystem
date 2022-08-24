const mongoose = require("mongoose");



const UserSchema= mongoose.Schema({

name:{
    type:String,
},
email:{
    type:String
},
mobile:{
    type:String
},
image:{
    type:String
},
password:{
    type:String,
},
is_admin:{
    type:Number,
    default:0

},
is_varified:{
    type:Number,
    default:0
},
token:{
    type:String,
    default:''
}
});



module.exports = mongoose.model("user",UserSchema);