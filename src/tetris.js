var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var engines = require("consolidate");

// game
game = require('./lib/game.js');
game.start();

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
        game.addDisplay(socket);
    });

    socket.on("snd.register-controller", function() {
        if (game.getState().key !== "splash") {
            return;
        }

        game.addController(socket);
    });

    socket.on("disconnect", function() {
        game.disconnect(socket);
    });
});