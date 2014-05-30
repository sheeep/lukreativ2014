var direction = {
    left: 1,
    right: 2,
    up: 3,
    down: 4
};

var Game = {};

/**
 * Drawing context, aka pane.
 */
Game.ctx = null;

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
Game.map = null;
Game.running = false;

// max x, max y, aka width/height of the matrix
Game.mx = 50;
Game.my = 50;

// width/height of a tile
Game.wx = 10;
Game.wy = 10;

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
Game.tickRate = 10;
Game.tick = 0;

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

Game.start = function(ctx) {
    Game.ctx = ctx;

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

    // Set the timer and reset render ticker
    Game.timer = (new Date()).getSeconds();
    Game.tick = 0;

    // Everybody stand back, we start the game loop!
    Game._interval = requestAnimationFrame(Game.run);
    Game.running = true;
};

Game.end = function() {
    cancelAnimationFrame(Game._interval);

    // clear player array by shoveling them to the queue
    for (var id in Game.players) {
        Game.queue[id] = Game.players[id].id;
        delete Game.players[id];
    }

    Game.running = false;
};

Game.run = function() {
    Game._interval = requestAnimationFrame(Game.run);

    // increment tick
    Game.tick++;

    if (Game.tick < Game.tickRate) {
        return;
    }

    Game.calculateState();
    Game.render();
    Game.checkFinishConditions();

    // reset ticker
    Game.tick = 0;
};

/**
 * Create the new state.
 */
Game.calculateState = function() {
    Game.movePlayers();
};

/**
 * Do the rendering, if required.
 */
Game.render = function() {
    Game.resetPane();

    for (id in Game.players) {
        Game.drawPlayer(id);
    }
};

Game.resetPane = function() {
    Game.ctx.clearRect(0, 0, (Game.mx - 1) * Game.wx, (Game.my - 1) * Game.wy);
};

Game.drawPlayer = function(id) {
    if (!id in Game.players) {
        return;
    }

    var player = Game.players[id];

    Game.ctx.fillRect(player.x, player.y, 10, 10);
};

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

Game.movePlayers = function() {
    for (id in Game.players) {

        var player = Game.players[id];

        switch (player.direction) {
            case direction.up:
                player.y -= Game.wy;
            break;

            case direction.down:
                player.y += Game.wy;
            break;

            case direction.left:
                player.x -= Game.wx;
            break;

            case direction.right:
                player.x += Game.wx
            break;
        }

        Game.players[id] = player;
    }
};

/**
 * Some in-game helper functions
 * TODO check if x/y are already taken.
 */
Game.createPlayer = function(id) {
    return {
        id: id,
        alive: true,
        direction: Game.rand(1, 4),
        x: Game.rand(0, (Game.mx - 1)) * Game.wx,
        y: Game.rand(0, (Game.my - 1)) * Game.wy

    };
};

Game.setDirection = function(playerId, direction) {
    if (playerId in Game.players) {
        Game.players[playerId].direction = direction;
    }
};

Game.rand = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};