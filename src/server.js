var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var engines = require("consolidate");

// lib
var Game = require("./lib/Game.js");
var Display = require("./lib/Display.js");
var Controller = require("./lib/Controller.js");
var Util = require("./lib/Util.js");

// configure application
app.set("views", __dirname + "/../views");
app.engine("html", engines.ejs);
app.set("view engine", "html");
app.use(express.static(__dirname + "/node_modules"));
app.use(express.static(__dirname + "/../public"));

server.listen(8090);

// initialize stuff
var game = new Game();

// routes
app.get("/", function(req, res) {
    res.render("display");
});

app.get("/controller", function(req, res) {
    res.render("controller");
});

// game
io.sockets.on("connection", function(socket) {

    // register a display
    socket.on("snd.register-display", function(data) {
        var id = Util.uuid();
        game.addDisplay(id, socket);

        // confirm
        socket.emit("rcv.register-display", {
            'success': true,
            'id': id
        });
    });

    // register a controller
    socket.on("snd.register-controller", function(data) {
        // check if game has an empty slot, if not return
        // an error to the controller
        if (false === game.hasEmptySlots()) {
            socket.emit("snd.register-controller", {
                'success': false
            });

            return;
        }

        var id = Util.uuid();
        game.addController(id, socket);

        socket.emit("rcv.register-controller", {
            'success': true,
            'id': id
        });

        game.emitDisplays("rcv.state", {
            'state': game.getState().getData()
        });
    });

    socket.on("snd.state", function() {
        game.emitDisplays("rcv.state", {
            'state': game.getState().getData()
        });
    })
});