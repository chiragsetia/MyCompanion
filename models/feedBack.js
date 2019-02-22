var mongo=require("mongoose");

var fbSchema=new mongo.Schema({
	review:String,
	author: {
      _id: {
         type: mongo.Schema.Types.ObjectId,
         ref: "Student"
      },
      name: String,
      rollNumber:String
   },
});

module.exports=mongo.model("Feedback",fbSchema);