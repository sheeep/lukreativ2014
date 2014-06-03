(function($) {

    // connect to socket
    var socket = io.connect(location.origin);
    var ctx = document.getElementById('snake').getContext('2d');

    socket.on("connect", function() {
        // register as controller
        socket.emit("snd.register-display");
    });

    socket.on("rcv.register-display", function(data) {
        if (!data.success) {
            alert("An error occured: " + data.message);
        }

        ready = true;
    });

    socket.on("rcv.new-controller", function(data) {
        Game.queue[data.id] = {
            id: data.id,
            color: data.color
        };
    });

    socket.on("rcv.controller-data", function(data) {
        Game.setDirection(data.id, data.direction);
    });

    socket.on("rcv.player-disconnect", function(data) {
        Game.disconnect(data.id);
    });

    socket.on("rcv.player-start", function(data) {
        Game.start(ctx);
    });

    Game.bus.addListener("ended", function() {
        socket.emit("snd.game-ended");
    });

    $('.start').click(function() {
        Game.start(ctx);
    });

    $('.end').click(function() {
        Game.end();
    });

})(jQuery);