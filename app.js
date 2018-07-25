let express = require("express");
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
let methodOverride = require("method-override");
let expressSanitizer = require("express-sanitizer");
let app = express();

//========================App Config=============================
// connect to database
mongoose.connect(process.env.MONGOLAB_URI, {useNewUrlParser: true});

// set up view engine
app.set("view engine", "ejs");

// serve static data
app.use(express.static("public"));

// parse the req body from client(retrieve data from form input)
app.use(bodyParser.urlencoded({extended: true}));

// method override for http
app.use(methodOverride("_method"));

// sanitizer to prevent xss scripting
app.use(expressSanitizer());

//========================Mongoose / Model Config===================
// setup schema used when modelling collections in database
let blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
});

// create collection in database by compiling the schema(modelling)
let Blog = mongoose.model("Blog", blogSchema);


// Blog.create({
//     title: "Akai",
//     image: "http://mobilelegendsbangbang.com/wp-content/uploads/2016/12/akai.jpg",
//     body: "Tanker Akai: Born to fight darkness"
// });

//=========================Start Routes=============================

app.get("/", function(req, res){
    res.redirect("/blogs");
});


// INDEX - show all blog posts
app.get("/blogs", function(req, res){
    // read(R) data from database and send them all to templete
    Blog.find({}, function(err, allBlogs){
        if(err){
            console.log("Error!");
        }else{
            res.render("index", {blogs: allBlogs});
        }
    });
});

// NEW - show form to create new blog post
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// CREATE - add new blog post to database
app.post("/blogs", function(req, res){

    // sanitize the potential data inputted from user
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // create(C) data and add to database
    Blog.create(req.body.blog, function(err, newBlogPost){
        if(err){
            console.log("Error!");
        }else{
            res.redirect("/blogs");
        }
    });
});

// SHOW - show more info about a specific blog post
app.get("/blogs/:id", function(req, res){
    // read(R) a specific data(blog post) from data base
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err);
        }else{
            res.render("show", {blog: foundBlog});
        }
    });
});

// EDIT - show edit form to edit a specific blog post
app.get("/blogs/:id/edit", function(req, res){
    // read(R) a specific data(blog post) from data base
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err);
        }else{
            res.render("edit", {blog: foundBlog});
        }    
    });
});

// UPEATE - update a specific blog post
app.put("/blogs/:id", function(req, res){

    // sanitize the potential data inputted from user
    req.body.blog.body = req.sanitize(req.body.blog.body);

    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            console.log("Error");
        }else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE - delete a specific blog post
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err, deletedBLog){
        if(err){
            console.log("Error!");
        }else{
            res.redirect("/blogs");
        }
    });
});


// listen requests from client
app.listen(process.env.PORT, function(){
    console.log("The server has started at port 3000");
});