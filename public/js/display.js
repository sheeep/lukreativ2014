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
        Game.bus.emitEvent("game.queue-player", [{
            id: data.id,
            color: data.color
        }]);
    });

    socket.on("rcv.controller-data", function(data) {
        Game.setDirection(data.id, data.direction);
    });

    socket.on("rcv.player-disconnect", function(data) {
        Game.bus.emitEvent("game.disconnect-player", [data]);
    });

    socket.on("rcv.player-start", function(data) {
        Game.start(ctx);
    });

    Game.bus.addListener("ended", function() {
        socket.emit("snd.game-ended");
    });

    Game.bus.addListener("game.queue-player", function(player) {
        var element = document.createElement('li');
        $(element).attr("id", "queue-" + player.id);
        $(element).css("background-color", player.color);

        $('#queue ul').append(element);
    });

    Game.bus.addListener("game.disconnect-player", function(data) {
        $("#queue ul li#queue-" + data.id).remove();
        $("#list ul li#player-" + data.id).remove();
    });

    Game.bus.addListener("game.player-joined", function(player) {
        // remove from queue
        $('#queue ul li#queue-'+ player.id).remove();

        // and append to player list
        var element = document.createElement('li');
        $(element).attr("id", "player-" + player.id);
        $(element).css("background-color", player.color);

        $("#list ul").append(element);
    });

})(jQuery);