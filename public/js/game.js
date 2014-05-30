var Game = {};

/**
 * Track players in the current game and
 * all the sockets in the queue for the
 * next game.
 */
Game.players = {};
Game.queue = {};

/**
 * The event bus to emit and listen to events.
 */
Game.bus = new EventEmitter();

/**
 * Some map and game options and data.
 */
Game.mx = 10;
Game.my = 10;
Game.map = null;
Game.running = false;

/**
 * Game Timer
 * Whereas roundTime is the amount of seconds to play
 * in one round (max). The timer represents the current
 * time and must be reset when the game starts.
 */
Game.roundTime = 10;
Game.timer = 10;

/**
 * Keep track of the interval id
 * to get rid of it, if the game
 * ends.
 */
Game._interval = null;

/**
 * "start/end" represents the Start and
 * the End of an actual play-round.
 *
 * "run" is the game loop.
 */
Game.ready = function() {
    // there is already a started game
    if (Game.running) {
        return false;
    }

    if (Object.keys(Game.queue).length >= 1) {
        return true;
    }

    return false;
};

Game.start = function() {
    // get all the players in the queue
    // and attach them to the game.
    for (var id in Game.queue) {
        Game.players[id] = Game.createPlayer(id);

        // and of course, remove it from the queue
        delete Game.queue[id];
    }

    // create / unset map
    var map = [];

    for (var x = 0; x < Game.mx; x++) {
        map[x] = [];

        for (var y = 0; y < Game.my; y++) {
            map[x][y] = 0;
        }
    }

    Game.map = map;

    // Set the timer
    Game.timer = (new Date()).getSeconds();

    // Everybody stand back, we start the game loop!
    Game._interval = requestAnimationFrame(Game.run);
    Game.running = true;
}

Game.end = function() {
    cancelAnimationFrame(Game._interval);

    // clear player array by shoveling them to the queue
    for (var id in Game.players) {
        Game.queue[id] = Game.players[id].id;
        delete Game.players[id];
    }

    Game.running = false;
}

Game.run = function() {
    Game._interval = requestAnimationFrame(Game.run);

    Game.checkFinishConditions();
}

/**
 * Game Logic!
 */
Game.checkFinishConditions = function() {
    var over = false;

    // first check if roundTime is over
    over |= Game.timer + Game.roundTime < (new Date()).getSeconds();

    if (over) {
        Game.end();
    }

    return over;
};

/**
 * Some in-game helper functions
 */
Game.createPlayer = function(id) {
    return {
        id: id,
        alive: true
    };
};