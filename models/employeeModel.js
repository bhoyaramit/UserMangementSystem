const mongoose = require("mongoose");



const EmployeeSchema= mongoose.Schema({

name:{
    type:String,
    required:true
},
email:{
    type:String
},
mobile:{
    type:String
},
password:{
    type:String,
    required:true
}
});



module.exports = mongoose.model("employee",EmployeeSchema);