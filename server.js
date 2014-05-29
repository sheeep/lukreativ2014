var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var engines = require("consolidate");
var colors = require("colors");

var Game = {};
var Log = {};

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
Game.display = null;
Game.controllers = {};

/**
 * You can provide a severity by passing a
 * number between 0 and 2.
 * 2: Debug
 * 1: Info
 * 0: Error
 */
Log.level = 2; // all
Log.out = function(msg, severity) {
    if (undefined === severity) {
        severity = 1;
    }

    // color prefix
    var prefix = "";

    switch (severity) {
        case 0: prefix = "[Error] ".red;   break;
        case 1: prefix = "[Info] ".yellow; break;
        case 2: prefix = "[Debug] ".green; break;
    }

    if (severity <= Log.level) {
        console.log(prefix + msg);
    }
};

io.sockets.on("connection", function(socket) {
    socket.on("snd.register-display", function() {
        Log.out("A display registered", 2);

        if (null === Game.display) {
            Game.display = socket;
            Game.display.emit("rcv.register-display", {
                success: true
            });

            return;
        }

        Log.out("There is already a display registered!", 0);

        // if already a display attached
        socket.emit("rcv.register-display", {
            success: false,
            message: "Display already registered"
        });
    });

    socket.on("snd.register-controller", function() {
        Log.out("A controller registered", 2);

        if (null === Game.display) {
            Log.out("There is no display registered!", 0);

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
        Log.out("Recieved controller data", 2);

        if (null === Game.display) {
            Log.out("There is no display registered!", 0);
            return;
        }

        Game.display.emit("rcv.controller-data", {
            id: socket.id,
            direction: data.direction
        });
    });

    socket.on("disconnect", function() {
        // Case 1: It was a controller
        if (socket.id in Game.controllers) {
            Log.out("Disconnected a controller!", 1);
            delete Game.controllers[socket.id];
        }

        // Case 2: No display attached
        if (null === Game.display) {
            Log.out("No display found to disconnect!", 1);
            return;
        }

        // Case 3: It was the display!
        if (Game.display.id === socket.id) {
            Log.out("Display disconnected, inform all collections!", 1);

            for (var i in Game.controllers) {
                Game.controllers[i].emit("rcv.display-disconnect");
            }

            Game.display = null;

            return;
        }
    });
});