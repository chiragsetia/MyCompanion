var mongo=require("mongoose");
var billSchema= new mongo.Schema({
	author: {
      _id: {
         type: mongo.Schema.Types.ObjectId,
         ref: "Student"
      },
      name: String,
      rollNumber:String
   },
	month:String,
	bill:Number
});

module.exports=mongo.model("Bill",billSchema);