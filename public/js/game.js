var Game = {};

/**
 * Track players in the current game and
 * all the sockets in the queue for the
 * next game.
 */
Game.players = {};
Game.queue = {};

/**
 * Some map options and data.
 */
Game.mx = 10;
Game.my = 10;
Game.map = null;

/**
 * Keep track of the interval id
 * to get rid of it, if the game
 * ends.
 */
Game.fps = 60;
Game._interval = null;

/**
 * "start/end" represents the Start and
 * the End of an actual play-round.
 *
 * "run" is the game loop.
 */
Game.start = function() {
    // get all the players in the queue
    // and attach them to the game.
    for (var id in Game.queue) {
        Game.players[id] = Game.queue[id];

        // and of course, remove it from the queue
        delete Game.queue[id];
    }

    // create / unset map
    var map = [];

    for (var x = 0; x < Game.mx; x++) {
        map[x] = [];

        for (var y = 0; < Game.my; y++) {
            map[x][y] = 0;
        }
    }

    Game.map = map;

    // Everybody stand back, we start the game loop!
    Game._interval = setInterval(Game.run, 1000 / Game.fps);
}

Game.end = function() {
    clearInterval(Game._interval);

    // clear player array by shoveling them to the queue
    for (var id in Game.players) {
        Game.queue[id] = Game.players[id];
        delete Game.players[id];
    }
}

Game.run = function() {
}
