var mongo=require("mongoose"),
	express=require("express"),
	app=express(),
	bodyParser=require("body-parser"),
	passport=require("passport"),
	pl=require("passport-local"),
	plm=require("passport-local-mongoose"),
	methodOverride=require("method-override"),
	LE=require("./models/leaveEntry"),
	FB=require("./models/feedBack"),
	menu=require("./models/Menu")
	Bill=require("./models/Bill"),
	Student=require("./models/Student"),
	Manager=require("./models/Manager"),
	cookieParser = require('cookie-parser');


	
mongo.connect("mongodb://localhost:27017/sw", {useNewUrlParser: true});
app.set("view engine", "ejs");// we don't have to put ejs at the end
//setting use
app.use(bodyParser.urlencoded({extended:true}));// for converting body element or things from body into js form
app.use(express.static("./public"));// for setting directory for css js files
app.use(methodOverride("_method"));// for put or delete routes
app.use(cookieParser());// for the use of cookies
app.use(require("express-session")({
    secret: "Session Started",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));


app.use(function(req, res, next) {// for clearing cookies regarding user
    if (!req.session.user) {
        res.clearCookie('user_sid');        
    }
    //console.log(req.session.user);
    res.locals.currentStudent=req.session.user;
    //console.log(req.user);
  // // Cookies that have been signed
  // console.log('Signed Cookies: ', req.signedCookies)
    next();
});
// for session
app.use(require("express-session")({
    secret: "Session Started",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));
//for password
app.use(passport.initialize());
app.use(passport.session());
passport.use(new pl(Manager.authenticate()));
passport.serializeUser(Manager.serializeUser());
passport.deserializeUser(Manager.deserializeUser());

//functions
function compareValues(s1,s2) {//for comparing two string alternative locale compare
	var array1 = s1.split("-").map(Number);//to convert string to number
	var array2 = s2.split("-").map(Number);

	var n1=array1[0]*365+array1[1]*30+array1[2];
	var n2=array2[0]*365+array2[1]*30+array2[2];
	//console.log(n1+" "+n2);
	if(n1>n2)
		return 1;
	else if(n1==n2)
		return 0;
	else
		return -1;
}




//setting routes
//startup page
app.get("/", function(req,res){
	res.render("landing")
});

//for Student
app.get("/Student",isLoggedInUser, function(req, res){
	res.render("./student/Student");
});
//for mark leave entry
app.get("/Student/MLE",isLoggedInUser, function(req, res){
	res.render("./student/MLE");
});

//post for mark leave entry
app.post("/Student/MLE",isLoggedInUser, function(req, res){
	//console.log(req.body.date);
	 var newLeaveEntry={
	 	author:req.session.user,
	 	returnDate:req.body.date,
	 	leaveDate:String(new Date().toJSON().slice(0,10)), //todayDay(),
	 	leaveAddress:req.body.LeaveAddress
	 }
	 LE.find({} ,function(err, leaves){
	 	if(err){
	 		console.log(err);
	 		//error handling
	 	}else{
	 		//console.log(leaves);
	 		var max="";
	 		leaves.forEach(function(leave){
	 			if(max.localeCompare(leave.returnDate)<0 && leave.author._id.equals(newLeaveEntry.author._id))
	 				{
	 					
	 					max=leave.returnDate;
	 				}
	 		});
	 		//console.log(id);
	 		if(id=""||compareValues(max,newLeaveEntry.leaveDate)<0){
	 			LE.create(newLeaveEntry, function(err,newEntry){
				 	if(err)
				 	{
				 		console.log(err);
				 		//error handling to be done
				 	}
				 	else
				 	{
				 		console.log(newEntry);
				 		res.redirect("/Student");
				 	}
				 });
	 		}else
	 			res.redirect("/Student");
	 		
	 	}
	 });
	 
});


//for feedback form

app.get("/Student/FB",isLoggedInUser,function(req,res){
	FB.find({},function(err,feedback){
		if(err){
			console.log(err);
			//error handling to be done
		}
		else
		{
			//console.log(feedback);
			console.log(feedback);
			res.render("./student/FB",{feedbacks:feedback});
		}
	});
});
//for new feedback

app.get("/Student/FB/new",isLoggedInUser, function(req,res){
	res.render("./student/fbNew");
});

//post for feedback

app.post("/Student/FB",isLoggedInUser, function(req,res){
	var newfb={
		author:req.session.user,
	 	review:req.body.review
	}
	FB.create(newfb, function(err, fb){
		if(err){
			console.log(err);
			//error handling
		}
		else{
			console.log(fb);
			res.redirect("/Student/FB");
		}
	})
});

//for menu for both 
app.get("/Menu", function(req,res){
	menu.find({},function(err,menu){
		if(err){
			console.log(err);
			//error handle
		}
		else{
			console.log(menu);
			res.render("./guest/Guest",{menu:menu});
		}
	});
});


//for bill
app.get("/Student/bill",isLoggedInUser,function(req,res){
	Bill.find({},function(err, bill){
		if(err){
			console.log(err);
			//error handling
		}else{
			res.render("./student/Bill",{bill:bill});
		}
	});
});
// login page

app.get("/Student/Login",function(req,res){
	res.render("./student/Login");
});
app.post("/Student/Login",function(req,res){
	Student.findOne({rollNumber:req.body.rollNumber},function(err,student){
		if(err){
			console.log(err);
		}else if(student==null){
			res.send("check roll number")
		}else{
			
			if(req.body.password===(student.password)){
				req.session.user = {
					name:student.name,
					rollNumber:student.rollNumber,
					_id:student._id
				};// setting its value to be not null
				//req.session.user = student.dataValues;
				//req.user=student;
				res.redirect("/Student");
				console.log("login post route")
				//console.log(req.session);
				//req.cookies.connect.sid
				
				//login.isLogin=true;
			}else{
				res.redirect("/Student/login");
			}
		}
	});
});



//----------------------------------------------------------------------------------------------

//for manager
app.use(function(req, res, next) {// for clearing cookies regarding user
    res.locals.currentUser = req.user;
    //console.log(req.user)
   
     
  // // Cookies that have been signed
  // console.log('Signed Cookies: ', req.signedCookies)
    next();
});

app.get("/Manager",isLoggedIn, function(req, res){
	//console.log(req.user);
	res.render("./manager/Manager");
});

//check leave entry
app.get("/Manager/CLE",isLoggedIn, function(req, res){
	LE.find({}, function(err,leaves){
		if(err){
			console.log(err)
			//error handling
		}else{
			console.log(leaves);
			res.render("./manager/CLE",{leaves:leaves})
		}
	});
});
// for delete mess leave

app.delete("/Manager/CLE/:id", isLoggedIn,function(req,res){
	LE.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
		}
		res.redirect("/Manager/CLE");
	});
});

//feedback

app.get("/Manager/CFB", isLoggedIn,function(req,res){
	FB.find({}, function(err, feedbacks){
		if(err){
			console.log(err)
			//error handling
		}else{
			res.render("./manager/CFB", {feedbacks:feedbacks});
		}
	});
});

//deleting fb

app.delete("/Manager/CFB/:id",isLoggedIn, function(req,res){
	FB.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
		}
		res.redirect("/Manager/CFB");
	});
});

//
app.get("/Manager/ReviewMenu", isLoggedIn, function(req,res){
	menu.find({},function(err,menu){
		if(err||menu==null){
			console.log(err);
			//error handling
		}else{
			res.render("./manager/RM",{menu:menu});
		}
	});
});
app.get("/Manager/ReviewMenu/:id/edit", isLoggedIn, function(req,res)
{
	menu.findById(req.params.id,function(err,menu){
		if(err||menu==null){
			console.log(err);
			//error handling
		}else{
			res.render("./manager/editMenu",{day:menu});
		}
	});
});

app.put("/Manager/ReviewMenu/:id",isLoggedIn, function(req,res){
	menu.findByIdAndUpdate(req.params.id, req.body.day ,function(err,updatedValue){
		if(err||menu.length==0){
			console.log(err);
		}
		else{
			console.log(updatedValue);
			res.redirect("/Manager/ReviewMenu")
		}
	});
});
// for student
app.get("/Manager/show", isLoggedIn, function(req,res){
	Student.find({},function(err,students){
		if(err){
			console.log(err)
			//error handling
		}else{
			//console.log(students);
			students.sort((a, b)=> (a.rollNumber > b.rollNumber) ? 1 : -1);// sorting done when 1
			//console.log(students);
			res.render("./manager/show",{students:students});
		}
	});
});

//for new student

app.get("/Manager/new",isLoggedIn, function(req,res){
	// Student.remove({},function(err){
	// 	res.render("./manager/new");	
	// });
	res.render("./manager/new");

});

app.post("/Manager/new",isLoggedIn, function(req,res){
	// Student.find({rollNumber:req.body.student.rollNumber}, function(err,student){
	// 	console.log(student.length);
	// 	if(err){
	// 		console.log(err);
	// 		//error handling
	// 	}else if(student.length==0){
	// 		console.log("new student");
			req.body.student.branch=req.body.student.branch.toUpperCase();
			Student.create(req.body.student,function(err,newEntry){
				if(err){
					console.log(err);
					res.redirect("/Manager/show");
				}else{
					console.log(newEntry);
					res.redirect("/Manager/show");
				}
			});
	// 	}else{
	// 		//message
	// 		console.log(student);
	// 		res.redirect("/Manager/show");
	// 	}
	// });
});

app.get("/Manager/show/:id",isLoggedIn, function(req,res){
	Student.findById(req.params.id,function(err,student){
		if(err){
			console.log(err);
			//error handling
		}else{
			res.render("./manager/edit",{student:student});
		}
	});
	
});
//edit for student
app.put("/Manager/edit/:id", isLoggedIn, function(req,res){
	req.body.student.branch=req.body.student.branch.toUpperCase();
	Student.findByIdAndUpdate(req.params.id,req.body.student,function(err, updatedValue){
		if(err){
			console.log(err);
			//error handling
		}else{
			res.redirect("/Manager/show");
		}
	});
});

//del for student
app.delete("/Manager/delete/:id", isLoggedIn, function(req,res){
	Student.findByIdAndRemove(req.params.id, function(err){
		if(err)
			console.log(err);
			//error handling
			res.redirect("/Manager/show");
	});
});
// for mess bill

app.get("/Manager/UploadBill",function(req,res){
	res.render("./manager/UploadBill");
})

//login page

app.get("/Manager/Login",function(req,res){
	res.render("./manager/Login");
});
//get for login

app.post("/Manager/login", passport.authenticate("local", 
    {
        successRedirect: "/Manager",
        failureRedirect: "/Manager/Login"
    }), function(req, res){
});

//SignUp

// app.get("/Manager/SignUp",function(req,res){
// 	res.render("./manager/Signup")
// });
// //starting the server
// app.post("/Manager/SignUp", function(req, res){
//     var newUser = new Manager({username: req.body.username});
//     Manager.register(newUser, req.body.password, function(err, user){
//         if(err){
//             //req.flash("error", err.message);
//             res.render("/Manager/SignUp");
//         }else
//         {
//         	passport.authenticate("local")(req, res, function(){
//         		console.log(user);
//            //req.flash("success", "Welcome to YelpCamp " + user.username);
//            res.redirect("/Manager"); 
//         	});
//         }
        
//     });
// });
//

app.get("/logout", function(req, res){
   req.logout();
   req.session.user=null;
   res.clearCookie('user_sid');//setting its value to be null
   //login.logout();
   //req.flash("success", "Logged you out!");
   res.redirect("/");
});


//middleWare

// for login

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		next();
	}else{
		res.redirect("/Manager/Login");
	}
}

function isLoggedInUser(req,res,next){
	//req.session.user=null;
	if(req.session.user){// && req.cookies.user_sid){ //req.session.user stores details of user
		next();
    }else{
    	res.redirect("/Student/Login");
    	//console.log("fail")
    }
}    
//for logout

// object for student login
// var login={
// 		isLogin:false,
// 		isAuthenticated: function(){
// 			return this.isLogin;
// 		},
// 		logout: function(){
// 			this.isLogin=false;
// 		}
// 	};
//for routes not found always at last
//for 404 routes routes not found
//eq to app.get("*",)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});

app.listen(8000, function(){
	console.log("Server has started");
});