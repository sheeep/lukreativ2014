var colors = require('colors');
var Game = require("./game.js");

var Log = {};

/**
 * You can provide a severity by passing a
 * number between 0 and 2.
 * 0: Debug
 * 1: Info
 * 2: Error
 */
Log.level = 2;
Log.out = function(msg, severity) {
    if (undefined === severity) {
        severity = 1;
    }

    // color prefix
    var prefix = "[" + Game.state.key + "] ";

    switch (severity) {
        case 0: prefix = prefix.green;
        case 1: prefix = prefix.yellow;
        case 2: prefix = prefix.red;
    }

    if (severity <= Log.level) {
        console.log(prefix + msg);
    }
};

Game.bus.on("display-added", function(socket, count) {
    Log.out("Display #" + count + " with id " + socket.id + " added.");
});

Game.bus.on("controller-added", function(socket, count) {
    Log.out("Controller #" + count + " with id " + socket.id + " added");
});

exports = Log;