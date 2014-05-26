var Util = require('../Util.js');

var Tetris = (function() {

    var key = 'tetris';
    var map = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ];

    var blocks = [
        [
            [
                [0, 1, 0],
                [1, 1, 1]
            ],
            [
                [1, 0],
                [1, 1],
                [1, 0],
            ],
            [
                [1, 1, 1],
                [0, 1, 0]
            ],
            [
                [0, 1],
                [1, 1],
                [0, 0],
            ]
        ]
    ];

    var blockCount = blocks.length;
    var blockVariants = 4;

    var self = (function() {
        var me = this;

        me.getData = function() {
            return {
                'stage': 'tetris',
                'map': map
            }
        };
    });

    var getNewBlock = function() {
        var idx = Util.rand(0, blockCount - 1);

        return blocks[idx][0];
    };

    /**
     * @param m1 Matrix 1,
     * @param m2 Matrix 2
     * @param ol Offset left for Matrix 2 in relation to 1
     * @param ot Offset top for Matrix 2 in relation to 1
     */
    var collides = function(m1, m2, ol, ot) {
        if (ol === undefined) ol = 0;
        if (ot === undefined) ot = 0;

        ol = Math.min(m1.length - m2.length, ol);
        ot = Math.min(m1[0].length - m2[0].length, ot);

        // build smaller test matrix m3
        var m3 = [];
        for (var i = 0; i < m2.length; i++) {
            m3[i] = [];
            for (var j = 0; j < m2[i].length; j++) {
                m3[i][j] = m1[i + ol][j + ot];
            }
        }

        for (var i = 0; i < m2.length; i++) {
            for (var j = 0; j < m2[i].length; j++) {
                if (m3[i][j] & m2[i][j]) {
                    return true;
                }
            }
        }

        return false;
    }

    return self;
})();

module.exports = Tetris;