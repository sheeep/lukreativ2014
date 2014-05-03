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
app.use(express.static(__dirname + "/../public"));

server.listen(8090);

// vars
var display;
var c1;
var c2;

// routes
app.get("/", function(req, res) {
    res.render("display");
});

app.get("/controller", function(req, res) {
    res.render("controller");
});

// game
io.sockets.on("connection", function(socket) {

    socket.on("register-display", function(data) {
        display = socket;
    });

    socket.on("register-controller", function(data) {
        if (display) {
            display.emit("controller-registered")
        }
    });

    socket.on("controller-data", function(data) {
        if (display) {
            display.emit("controller-data");
        }
    });

});