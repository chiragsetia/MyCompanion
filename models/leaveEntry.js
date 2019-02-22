var mongo=require("mongoose");

var LESchema=new mongo.Schema({
	author: {
      _id: {
         type: mongo.Schema.Types.ObjectId,
         ref: "Student"
      },
      name: String,
      rollNumber:String
   },
	returnDate:String,//{ type: Date, default: Date.now },
	leaveDate:String,//{ type: Date, default: Date.now },
	leaveAddress:String

});
var LE = mongo.model("LeaveEntry", LESchema);

module.exports=LE;