var Game = require("../Game.js");

var Tetris = {};

Tetris.key = "game";

/**
 * Return the view data for this state
 */
Tetris.view = function() {
    return {};
};

Tetris.init = function() {
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
    Tetris._interval = setInterval(Tetris.run, 1000 / Tetris.fps);
};

Tetris.end = function() {
    clearInterval(Tetris._interval);
};

/**
 * The actual game loop!
 */
Tetris.iteration = 0;
Tetris.run = function() {

    if (Tetris.iteration % Tetris.fps === 0) {
        Tetris.iteration = 0;
    }

    Tetris.iteration++;
};

/**
 * The map data.
 * You can set w/h attributes to different
 * if you want.
 */
Tetris.x = 5;
Tetris.y = 5;
Tetris.map = null;

/**
 * Interval stuff
 */
Tetris.fps = 60;


/**
 * An array of block and its variants
 * Credits: http://codeincomplete.com/posts/2011/10/10/javascript_tetris/
 */
Tetris.blocks = {
    i: { blocks: [0x0F00, 0x2222, 0x00F0, 0x4444], color: 'cyan'   },
    j: { blocks: [0x44C0, 0x8E00, 0x6440, 0x0E20], color: 'blue'   },
    l: { blocks: [0x4460, 0x0E80, 0xC440, 0x2E00], color: 'orange' },
    o: { blocks: [0xCC00, 0xCC00, 0xCC00, 0xCC00], color: 'yellow' },
    s: { blocks: [0x06C0, 0x8C40, 0x6C00, 0x4620], color: 'green'  },
    t: { blocks: [0x0E40, 0x4C40, 0x4E00, 0x4640], color: 'purple' },
    z: { blocks: [0x0C60, 0x4C80, 0xC600, 0x2640], color: 'red'    }
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
    var bit, result, row = 0, col = 0, blocks = type.blocks[dir];

    for(bit = 0x8000 ; bit > 0 ; bit = bit >> 1) {
        if (blocks & bit) {
            callback(x + col, y + row);
        }

        if (++col === 4) {
            col = 0;
            ++row;
        }
    }
};

module.exports = Tetris;