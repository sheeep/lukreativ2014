var Splash = (function() {
    var key = 'tetris';

    var self = (function() {
        var me = this;

        me.getData = function() {
            return {
                'stage': key
            };
        };
    });

    return self;
})();

module.exports = Splash;