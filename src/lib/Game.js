// connections
var displays = {};
var controllers = {};

// state machine
var currently = null;
var states = {
    splash: {
        key: "splash",
        run: function() {
            // pass, only listen to signals
        }
    },
    tetris: {
        key: "tetris",
        run: function() {
            console.log("meep");
        }
    },
    end: {
        key: "end",
        run: function() {
            // pass, only listen to signals
        }
    }
};

// interval

exports.start = function() {
    currently = states.splash;
    console.log("Game started. Awaiting connections.");
};

exports.getState = function() {
    return currently;
}

exports.addDisplay = function(socket) {
    displays[socket.id] = socket;
    console.log("Added a display. Totals to " + Object.keys(displays).length);
}

exports.addController = function(socket) {
    controllers[socket.id] = socket;
    console.log("Added a controller. Totals to " + Object.keys(controllers).length);
}

exports.disconnect = function(socket) {
    if (displays[socket.id]) {
        delete displays[socket.id];
        console.log("A display disconnected.");
    }

    if (controllers[socket.id]) {
        delete controllers[socket.id];
        console.log("A controller disconnected.");
    }
}

exports.run = function() {
    set
};