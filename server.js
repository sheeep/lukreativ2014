var express = require("express");
var app = express();
var server = require("http").createServer(app);
var engines = require("consolidate");

app.set("views", __dirname + "/views");
app.engine("html", engines.ejs);
app.set("view engine", "html");
app.use(express.static(__dirname + "/node_modules"));
app.use(express.static(__dirname + "/public"));

server.listen(8090);

app.get("/", function(req, res) {
    res.render("display");
});

app.get("/controller", function(req, res) {
    res.render("controller");
});