var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
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

app.get("/thanks", function(req, res) {
    res.render("thanks");
});

/**
 * Game related stuff, mostly socket
 * handler and helpers
 */
Game = {};
Game.display = null;
Game.controllers = {};

io.sockets.on("connection", function(socket) {
    socket.on("snd.register-display", function() {
        if (null === Game.display) {
            Game.display = socket;
            Game.display.emit("rcv.register-display", {
                success: true
            });

            return;
        }

        // if already a display attached
        socket.emit("rcv.register-display", {
            success: false,
            message: "Display already registered"
        });
    });

    socket.on("snd.register-controller", function() {
        if (null === Game.display) {
            socket.emit("rcv.register-controller", {
                success: false,
                message: "No display registered"
            });

            return;
        }

        Game.controllers[socket.id] = socket;
        Game.display.emit("rcv.new-controller", {
            id: socket.id
        });

    });

    socket.on("snd.controller-data", function(data) {
        Game.display.emit("rcv.controller-data", {
            id: socket.id,
            direction: data.direction
        });
    });

    socket.on("disconnect", function() {
        // Case 1: It was a controller
        if (socket.id in Game.controllers) {
            delete Game.controllers[socket.id];
        }

        // Case 2: No display attached
        if (null === Game.display) {
            return;
        }

        // Case 3: It was the display!
        if (Game.display.id === socket.id) {
            for (var i in Game.controllers) {
                Game.controllers[sock].emit("rcv.display-disconnect");
            }

            return;
        }
    });
});