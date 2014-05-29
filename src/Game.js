// imports
var events = require("events");

// states
var Intro = require("./states/Intro.js");
var Outro = require("./states/Outro.js");
var Tetris = require("./states/Tetris.js");

/**
 * The application object, containing
 * all states and methods needed.
 */
var Game = {};

/**
 * Define an event bus to decouple
 * some stuff.
 */
Game.bus = new events.EventEmitter();

/**
 * State helpers.
 *
 * A state represents a part of the game
 * that needs to be rendered differently.
 * Say for example: A menu, the main loop
 * and an outro.
 */
Game.states = {
    intro: Intro,
    game: Tetris,
    outro: Outro
};

Game.state = null;
Game.view = function() {
    return Game.state.view();
};

/**
 * Socket helpers.
 *
 * There are two kind of sockets in this
 * game: Controllers and Displays. The
 * max number of controllers allowed is 2
 * whereas there could be an infinite count
 * of displays watching.
 */
Game.controllers = {};
Game.displays = {};

Game.addController = function(socket) {
    Game.controllers[socket.id] = socket;
    Game.bus.emit("controller-added", socket, Object.keys(Game.controllers).length);
};

Game.addDisplay = function(socket) {
    Game.displays[socket.id] = socket;
    Game.bus.emit("display-added", socket, Object.keys(Game.displays).length);
};

Game.disconnect = function(socket) {
    // socket is either a display or a controller
    if (Game.displays[socket.id]) {
        delete Game.displays[socket.id];
    }

    if (Game.controllers[socket.id]) {
        delete Game.controllers[socket.id];
    }
}

/**
 * Actual loop/game related stuff.
 * Set the first state to intro on bootup.
 */
Game.fps = 60;
Game.boot = function() {
    Game.states.intro.init();
    Game.states.game.init();
    Game.states.outro.init();

    Game.state = Game.states.intro;
};

Game.run = function() {
    console.log("here");
};

//Game._intervalId = setInterval(Game.run, 1000 / Game.fps);

module.exports = Game;