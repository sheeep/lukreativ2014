var Game = require("../Game.js");

// Directions
var DIR = { UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3, MIN: 0, MAX: 3};

// The tetris state
var Tetris = {};

Tetris.key = "game";
Tetris.players = {};

/**
 * Return the view data for this state
 */
Tetris.view = function() {
    return {};
};

Tetris.init = function() {
    // fill map with zero values
    var map = [];

    for (var x = 0; x < Tetris.x; x++) {
        map[x] = [];
        for (var y = 0; y < Tetris.y; y++) {
            map[x][y] = 0;
        }
    }

    Tetris.map = map;
};

Tetris.start = function() {
    // create the players array
    var c = 0;
    for (var idx in Game.controllers) {
        Tetris.players[idx] = { block: null, x: 0, y: 0, i: c, dir: DIR.UP };

        // the players number
        // only one or two will ever
        // be used.
        c++;
    }

    // start the game loop
    Tetris._interval = setInterval(Tetris.run, 1000 / Tetris.fps);
};

Tetris.end = function() {
    // stop game loop
    clearInterval(Tetris._interval);

    // cleanup
    Tetris.players = {};
};

/**
 * The actual game loop!
 */
Tetris.iteration = 0;
Tetris.run = function() {

    // TickTime™
    if (Tetris.iteration % Tetris.fps === 0) {

        // check if someone has no block and allocate
        // a new one to this player.
        Tetris.allocatePlayerBlocks();

        // move all blocks to y-1

        Tetris.iteration = 0;
    }

    Tetris.iteration++;
};

/**
 * The map data.
 * You can set w/h attributes to different
 * if you want.
 * x Should be divisable by {players.length}
 */
Tetris.x = 6;
Tetris.y = 12;
Tetris.map = null;

/**
 * Interval stuff
 */
Tetris.fps = 60;
Tetris._interval = null;

/**
 * An array of block and its variants
 * Credits: http://codeincomplete.com/posts/2011/10/10/javascript_tetris/
 */
Tetris.blocks = {
    i: { variants: [0x0F00, 0x2222, 0x00F0, 0x4444], type: 'i' },
    j: { variants: [0x44C0, 0x8E00, 0x6440, 0x0E20], type: 'j' },
    l: { variants: [0x4460, 0x0E80, 0xC440, 0x2E00], type: 'l' },
    o: { variants: [0xCC00, 0xCC00, 0xCC00, 0xCC00], type: 'o' },
    s: { variants: [0x06C0, 0x8C40, 0x6C00, 0x4620], type: 's' },
    t: { variants: [0x0E40, 0x4C40, 0x4E00, 0x4640], type: 't' },
    z: { variants: [0x0C60, 0x4C80, 0xC600, 0x2640], type: 'z' }
}

Tetris.blockTaken = function(x, y) {
    return Tetris.map[x][y] > 0;
};

Tetris.occupied = function(type, x, y, dir) {
    var result = false;

    Tetris.eachblock(type, x, y, dir, function(x, y) {
        if ((x < 0) || (x >= nx) || (y < 0) || (y >= ny) || getBlock(x,y)) {
            result = true;
        }
    });

    return result;
};

Tetris.eachBlock = function(type, x, y, dir, callback) {
    var bit, result, row = 0, col = 0, variant = type.variants[dir];

    for(bit = 0x8000 ; bit > 0 ; bit = bit >> 1) {
        if (variant & bit) {
            callback(x + col, y + row);
        }

        if (++col === 4) {
            col = 0;
            ++row;
        }
    }
};

Tetris.unusedBlocks = [];
Tetris.getRandomBlock = function() {
    if (Tetris.unusedBlocks.length === 0) {
        Tetris.unusedBlocks = [];

        // push each block 4 times to the unusedBlocks
        for (var i in Tetris.blocks) {
            for (var j = 0; j < 4; j++) {
                Tetris.unusedBlocks.push(Tetris.blocks[i]);
            }
        }
    }

    var type = Tetris.unusedBlocks.splice(Math.random(0, Tetris.unusedBlocks.length-1), 1)[0];

    return type;
};

Tetris.allocatePlayerBlocks = function() {
    for (var idx in players) {
        var player = players[idx];

        if (null === player.block) {
            player.block = Tetris.getRandomBlock()
            player.x = player.c * (Tetris.x / players.length);
            player.y = 0;
            player.dir = DIR.UP;
        }

        players[idx] = player;
    }
};

module.exports = Tetris;