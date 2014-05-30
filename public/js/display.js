(function($) {

    // connect to socket
    var socket = io.connect(location.origin);

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
        Game.queue[data.id] = {};
    });

    socket.on("rcv.controller-data", function(data) {
        Game.setDirection(data.id, data.direction);
    });

    $('.start').click(function() {
        Game.start(document.getElementById('snake').getContext('2d'));
    });

    $('.end').click(function() {
        Game.end();
    });

})(jQuery);