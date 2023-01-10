const express = require('express'); //requried express module
const bodyParser = require('body-parser'); //required bodyParser module
const mongoose = require('mongoose'); //required mongoose
const path = require('path');
const d= new Date();
const app = express(); //receving app object of express function


mongoose.connect("mongodb+srv://admin:admin@cluster0.xayp8.mongodb.net/librarydb", {
  useNewUrlParser: true
});
/*This statement connects to the mongodb database*/



const bookSchema = {
  name: String,
  author: String,
  availibility: {
    type:Boolean,
    default:true,
  },
  genre:String,
  date: Number,
  owner:{
    type:String,
    default:"",
  }
};

const Book = mongoose.model("Book", bookSchema);

const book1 = new Book({
  name: "The Swastik Chapter 1: Rise of the pheonix",
  author: "Rishi Rusia",
  availibility: false,
  genre:"Science Fiction",
  date:Date.now()-1728000000,
  owner:"Selmon Bhoi",
});
const book2 = new Book({
  name: "Rishi",
  author: "Ram Rusiya",
  availibility: false,
  genre:"Non-Fiction",
  date:Date.now()-1728000000,
  owner:"Arnab Goswami",
});
const book3 = new Book({
  name: "The rise of civilization ",
  author: "Vagish Franku",
  availibility: true,
  genre:"History",
  date:Date.now()-1728000000,
  owner:"Narendra Modi",
});

const defaultbooks = [book1, book2, book3];

Book.find({},function (err,data) {
  if(data.length==0)
  {
    Book.insertMany(defaultbooks, function(err) {
      if (!err) {
        console.log("InsertMany Successful");
      } else {
        console.log("Error: " + err);
      }
    });

  }
  else{
    console.log("Current data length is"==data.length);
  }
});


var dbcount=Book.count();

console.log(dbcount);








app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(req, res) {
  res.render("landing.ejs");
});

app.post("/", function(req, res) {
  console.log(req.body.main_login_button);
  res.redirect("/signup");
});

//CODE FOR SIGNUP BEGINS

app.get("/signup", function(req, res) {
  res.render("signup.ejs",{errormessage:""});
});



app.post("/signup", function(req, res) {
  if (req.body.username == "admin@123" && req.body.password == "admin") {
    res.redirect("/working");
  }
  else {
    res.render("signup.ejs",{errormessage:"Login failed. Please check your Id and password."});
  }

});

//Code for Signup ENDS

//code for working page begins

app.get("/working", function(req, res) {
  res.render("working.ejs");
});

app.post("/working", function(req, res) {

});

//code for working page ends

//code for searchpage Begins

app.get("/searchpage", function(req, res) {
  res.render("search.ejs",{dataItems:[]});
});

app.post("/searchpage",function (req,res) {
  console.log(req.body.name_of_book_searched);

  console.log(Book.find({name:req.body.name_of_book_searched},function (err,data) {
    // console.log(data.name);
    data.forEach((item) => {
      console.log(item.name);

    });

    if(data==[])
    {
      res.redirect("/searchpage");
    }
    else {
      res.render("search",{dataItems:data});
    }

  }));

});//end of app.post

//code for searchpage ends

//code for adding books begins

app.get("/addbooks",function (req,res) {
  res.render("addbooks.ejs",{errormessage:""});
});

app.post("/addbooks",function (req,res) {

  Book.insertMany([{
    name: req.body.title,
    author: req.body.author,
    availibility: true,
    genre:req.body.genre,
    date:Date.now(),
    owner:"",
  }]);


  console.log(req.body.title+" added");

  res.render("addbooks.ejs",{ errormessage: "Your book has been addded to the database", });
});

//code for adding books ends

//code for deleting books starts

app.get("/delete",function (req,res) {
  res.render("delete.ejs",{errormessage:""});
});

app.post("/delete",function (req,res) {


  Book.findById(req.body.bookid, function (err,data) {
    if(data)
    {
      console.log("deleting "+ data.name);
      Book.deleteOne({_id:req.body.bookid},function (err) {
        console.log("I am inside deletone UwU");
          console.log(req.body.bookid);
          console.log(data._id);
      });
      res.render("delete.ejs",{errormessage:"deletion Successful"});
    }
    else {
      res.render("delete.ejs",{errormessage:"Book not found"});
    }

  });


});

//code for deleting books ends

//code for catalouge BEGINS

app.get("/catalouge",function (req,res) {

  Book.find({},function (err,data) {
    // console.log(data.name);

    res.render("catalouge.ejs",{dataItems:data});

  });

});

//code for catalouge ends

//code for issue books starts

app.get("/issue",function (req,res) {

  Book.find({availibility:true,},function (err,data) {
    // console.log(data.name);

    console.log(Date.now());

    res.render("issue.ejs",{dataItems:data,today:(d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear())});



  });
});

app.post("/issue",function (req,res) {

  Book.findById(req.body.bookid,function (err,data) {
    if(data)
    {
      data.availibility=false;
      data.owner=req.body.owner;
      data.date=Date.now();
      data.save();
      console.log(data);
        res.redirect("/issue",);
    }
    else
    {
        res.redirect("/issue",);
    }
  });

});

//code for issue books ends

//code for Late fine calculation starts




app.get("/latefine",function (req,res) {

  var issue_array=[];
  var fine_array=[];

  Book.find({availibility:false,},function (err,data) {
    // console.log(data.name);

    if(data){
      console.log(Date.now());

      for (var i = 0; i < data.length; i++) {
        console.log(data[i].date);

        var local_date= new Date(data[i].date);

        var issue_date= (local_date.getDate()+"/"+(local_date.getMonth()+1)+"/"+local_date.getFullYear());

        issue_array.push(issue_date);


        var fine=0+" .rs";


        if((Date.now() - data[i].date)>=604800000)
        {
          fine=Math.round(((Date.now() - data[i].date-604800000)/86400000)*5)+" rs.";
        }

        fine_array.push(fine);
      }

      res.render("latefine.ejs",{dataItems:data,today:(d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()),late_fine:fine_array,issue_date:issue_array});
      }
      else {
              res.render("latefine.ejs",{dataItems:data,today:(d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()),late_fine:fine_array,issue_date:issue_array});
      }


  });
});

app.post("/latefine",function (req,res) {

  Book.findById(req.body.bookid,function (err,data) {
    if(data)
    {
      data.availibility=true;
      data.owner="";
      data.date=Date.now();
      data.save();
      console.log(data);
        res.redirect("/latefine");
    }
    else
    {
        res.redirect("/latefine");
    }
  });

});

//code fot late fine calculation ends

app.get("/contact",function (req,res) {
  res.render("contact.ejs");
});

app.get("/pricing",function (req,res) {
  res.render("pricing.ejs");
});

app.get("/about",function (req,res) {
  res.render("about.ejs");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
