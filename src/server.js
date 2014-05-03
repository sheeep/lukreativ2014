var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var engines = require("consolidate");

// configure application
app.set("views", __dirname + "/../views");
app.engine("html", engines.ejs);
app.set("view engine", "html");
app.use(express.static(__dirname + "/node_modules"));
app.use(express.static(__dirname + "/resources"));

server.listen(8090);

// routes
app.get("/", function(req, res) {
    res.render("index");
});

app.get("/display", function(req, res) {
    res.render("display");
});

app.get("/controller", function(req, res) {
    res.render("controller");
});