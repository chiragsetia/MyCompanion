var mongo= require("mongoose");

var studentSchema= new mongo.Schema({
	rollNumber:{
		type:String,
		unique: true,
        allowNull: false
		},
	name:String,
	password:String,
	year:Number,
	branch:String,
	contactNumber:Number
});

//studentSchema.plugin(require("passport-local-mongoose"));
module.exports=mongo.model("Student",studentSchema);