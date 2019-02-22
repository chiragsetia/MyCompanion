var mongo =require("mongoose");
var managerSchema=new mongo.Schema({
	user:String,
	password:String
});

managerSchema.plugin(require("passport-local-mongoose"));
module.exports=mongo.model("Manager",managerSchema);
