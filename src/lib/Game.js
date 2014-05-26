var Splash = require('./Stage/Splash.js');
var Tetris = require('./Stage/Tetris.js');

var Game = (function() {

    var states = {
        'splash': new Splash(),
        'tetris': new Tetris()
    };

    var controllers = [];
    var displays = [];
    var state = states.tetris;

    // constructor
    var self = (function() {
        var me = this;

        me.getState = function() {
            return state;
        };

        me.emitDisplays = function (type, data) {
            for (var i = 0; i < displays.length; i++) {
                displays[i].socket.emit(type, data);
            }
        };

        me.addDisplay = function (id, socket) {
            displays.push({
                'id': id,
                'socket': socket
            })
        };

        me.hasEmptySlots = function () {
            return controllers.length < 2;
        };

        me.addController = function(id, socket) {
            controllers.push({
                'id': id,
                'socket': socket
            });
        };
    });

    return self;
})();

module.exports = Game;