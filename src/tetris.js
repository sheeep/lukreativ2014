var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var engines = require("consolidate");

var Log = require("./lib/log.js");
var Game = require("./lib/game.js");

// start game
Game.boot();

// configure application
app.set("views", __dirname + "/../views");
app.engine("html", engines.ejs);
app.set("view engine", "html");
app.use(express.static(__dirname + "/node_modules"));
app.use(express.static(__dirname + "/../public"));

server.listen(8090);

// routes
app.get("/", function(req, res) {
    res.render("display");
});

app.get("/controller", function(req, res) {
    res.render("controller");
});

// game
io.sockets.on("connection", function(socket) {

    socket.on("snd.register-display", function() {
        Game.addDisplay(socket);
    });

    socket.on("snd.register-controller", function() {
        if (Game.getState().key !== "intro") {
            return;
        }

        Game.addController(socket);
    });

    socket.on("disconnect", function() {
        Game.disconnect(socket);
    });
});