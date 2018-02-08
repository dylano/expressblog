var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var expressSanitizer = require('express-sanitizer');
var mongoose = require('mongoose');
var methodOverride = require('method-override');

var PORT = 3000;

// app config
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.set("view engine", "ejs");

// app data
mongoose.connect("mongodb://localhost/blog");
var blogSchema = mongoose.Schema({
    title: String,
    image: String, 
    body: String, 
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// ROUTES 
app.get('/', function(req, res) {
    res.redirect('/blogs');
});

// INDEX
app.get('/blogs', function(req, res) {
    Blog.find({})
        .then(function(blogs){
            res.render('index', {blogs: blogs})
        })
        .catch(function(err) {
            console.log('Find error: ' + err);
        });
});

// NEW
app.get('/blogs/new', function(req, res){
    res.render('new');
});

// CREATE
app.post('/blogs', function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog)
        .then(function(blog){
            res.redirect('/blogs');
        })
        .catch(function(err){
            console.log('Create error: ' + err);
            res.render('new');
        });
});

// SHOW
app.get('/blogs/:id', function(req, res){
    Blog.findById(req.params.id)
        .then(function(blog){
            res.render("show", {blog: blog});
        })
        .catch(function(err){
            console.log('Find error: ' + err);
            res.redirect('/blogs');
        });
});

// EDIT
app.get('/blogs/:id/edit', function(req, res){
    Blog.findById(req.params.id)
        .then(function(blog){
            res.render('edit', {blog: blog});
        })
        .catch(function(err){
            console.log('Find error: ' + err);
            res.redirect('/blogs');
        });
});

// UPDATE
app.put('/blogs/:id', function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog)
        .then(function(blog){
            res.redirect('/blogs/' + req.params.id);
        })
        .catch(function(err){
            console.log('Update error: ' + err);
            res.redirect('/blogs');
        });
});

// DELETE
app.delete('/blogs/:id', function(req, res){
    Blog.findByIdAndRemove(req.params.id)
        .then(function(blog){
            res.redirect('/blogs');
        })
        .catch(function(err){
            console.log('Remove error: ' + err);
            res.redirect('/blogs');
        })
});

app.listen(PORT, function(){
    console.log('Blog app listening on port ' + PORT + '...');
});
