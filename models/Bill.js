var mongo=require("mongoose");
var billSchema= new mongo.Schema({
	author: {
      rollNumber:String
   },
	month:String,
	bill:Number
});

module.exports=mongo.model("Bill",billSchema);