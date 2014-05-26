var Util = (function() {
    var me = function() {};

    me.rand = function(min, max) {
        return Math.floor(Math.random() * (max - min) + max);
    }

    me.uuid = function() {
        return me.rand(0, 10000);
    }

    return me;
})();

module.exports = Util;