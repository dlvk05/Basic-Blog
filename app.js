var expressSanitizer = require("express-sanitizer"),
express = require("express"),
bodyParser= require("body-parser"),
methodOverride = require("method-override"),
mongoose = require("mongoose"),
app=express();

//APP CONFIG
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());//has to to after body parser
app.use(express.static("public"));
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set('useFindAndModify', false);
app.use(methodOverride("_method"));

mongoose.connect("mongodb://localhost/restful_blog_app");

//MONGOOSE MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    created: {type: Date, default: Date.now} 
});

var Blog = mongoose.model("Blog",blogSchema);

//RESTFUL ROUTES

app.get("/",(req,res)=>{
    res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs",(req,res)=>{
    Blog.find({},(err,blogs)=>{
        if(err)
        {
            console.log(err);
        }
        else{
            res.render("index",{blogs: blogs});
        }
    })
});

//NEW ROUTE
app.get("/blogs/new",(req,res)=>{
    res.render("new");
});
//CREATE ROUTE
app.post("/blogs",(req,res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);//removes script tags
    Blog.create(req.body.blog,(err,newBlog)=>{
        if(err)
        {
            res.render("new");
        }
        else{
            res.redirect("/blogs")
        }
    });   
}); 
//SHOW ROUTE
app.get("/blogs/:id",(req,res)=>{
    Blog.findById(req.params.id,(err,foundBlog)=>{
        if(err)
        {
            res.redirect("/blogs");
        }
        else{
            res.render("show",{blog: foundBlog});
        }
    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit",(req,res)=>{
    Blog.findById(req.params.id,(err,foundBlog)=>{
        if(err)
        {
            res.redirect("/blogs");
        }
        else{
            res.render("edit",{blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id",(req,res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,(err,updatedBlog)=>{
        if(err){
            res.redirect("/blogs")
        }
        else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});
//DESTROY ROUTE
app.delete("/blogs/:id",(req,res)=>{
   Blog.findByIdAndRemove(req.params.id,err=>{
       if(err)
       {
           res.redirect("/blogs");
       }
       else{
           res.redirect("/blogs");
       }
   });
});

app.listen(3000,()=>{
    console.log("server listening on port 3000");
});