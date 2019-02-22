var mongo=require("mongoose");
var menuSchema = new mongo.Schema({
	day:String,
	breakfast:String,
	lunch:String,
	dinner:String
});

module.exports=mongo.model("Menu",menuSchema);