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

    for (var h = 0; h < Tetris.h; h++) {
        map[h] = [];
        for (var w = 0; w < Tetris.w; w++) {
            map[h][w] = 0;
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
Tetris.run = function() {
};

/**
 * The map data.
 * You can set w/h attributes to different
 * if you want.
 */
Tetris.w = 5;
Tetris.h = 5;
Tetris.map = null;

/**
 * Interval stuff
 */
Tetris.fps = 60;
Tetris._interval = null;

/**
 * An array of block and its variants
 * A variant represents a rotation state
 */
Tetris.blocks = [
    [
        [
            [0, 0, 1],
            [1, 1, 1],
        ],
        [
            [1, 0],
            [1, 0],
            [1, 1],
        ],
        [
            [1, 1, 1],
            [1, 0, 0],
        ],
        [
            [1, 1],
            [0, 1],
            [0, 1],
        ]
    ]
];

module.exports = Tetris;