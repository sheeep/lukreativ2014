(function($) {

    // connect to socket
    var socket = io.connect(location.origin);
    var ctx = document.getElementById('snake').getContext('2d');
    var locked = false;

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

        socket.emit("snd.startable", Game.ready() && !locked);
    });

    socket.on("rcv.controller-data", function(data) {
        Game.setDirection(data.id, data.direction);
    });

    socket.on("rcv.player-disconnect", function(data) {
        Game.bus.emitEvent("game.disconnect-player", [data]);
    });

    socket.on("rcv.player-start", function(data) {
        if (locked) {
            return;
        }

        Game.start(ctx);
    });

    Game.bus.addListener("game.ended", function(winners) {
        // lock new games
        locked = true;

        // hide buttons on controllers
        socket.emit("snd.startable", false);

        var board = $('#winner');

        for (var i = 0; i < winners.length; i++) {
            var player = winners[i];
            var element = document.createElement('li');

            $(element).attr("id", "winner-" + player.id);
            $(element).css("background-color", player.color);
            $(element).append("<span class=\"fa-stack\"><i class=\"fa fa-stack-2x fa-circle\"></i><i class=\"fa fa-stack-1x fa-inverse fa-trophy\"></i></span>");

            $('ul', board).append(element);
        }

        setTimeout(function() {
            board.fadeIn("slow");

            setTimeout(function() {
                board.fadeOut("slow", function() {
                    locked = false;
                    $('ul', board).empty();

                    // show buttons on controllers
                    socket.emit("snd.startable", true);
                });
            }, 10000);
        }, 1500);

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
        $(element).html("<span class=\"fa-stack\"><i class=\"fa fa-stack-2x fa-circle\"></i><i class=\"fa fa-stack-1x fa-inverse\">"+ player.score +"</i></span>");

        $("#list ul").append(element);
    });

    Game.bus.addListener("game.score-changed", function(player) {
        $("#list ul li#player-" + player.id).html("<span class=\"fa-stack\"><i class=\"fa fa-stack-2x fa-circle\"></i><i class=\"fa fa-stack-1x fa-inverse\">"+ player.score +"</i></span>");
    });

    Game.bus.addListener("game.time", function(time) {
        $('#clock').text(format(time));
    });

    Game.bus.addListener("game.started", function() {
        locked = true;
        socket.emit("snd.startable", false);
    });

    // http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
    function pad(n, width) {
        z = 0;
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

    function format(time) {
        var m = Math.floor(time / 60);
        time = time % 60;
        var s = Math.floor(time);

        return pad(m, 2) + ":" + pad(s, 2);
    }

})(jQuery);