var Controller = (function() {

    var me = (function(id, socket) {
        this.id = id;
        this.socket = socket;
    });

    return me;
})();

module.exports = Controller;