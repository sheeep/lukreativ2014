(function($) {

    var direction = {
        left:   0x01,
        right:  0x02,
        up:     0x03,
        down:   0x04
    };

    var routes = {
        "thanks": "/thanks"
    };

    // connect to socket
    var socket = io.connect(location.origin);

    socket.on("connect", function() {
        // register as controller
        socket.emit("snd.register-controller");

        $(".button").on("click", function(event) {
            var id = $(this).attr('id');

            socket.emit("snd.controller-data", {
                direction: direction[$(this).attr('id')]
            });
        });
    });

    socket.on("rcv.register-controller", function(data) {
        // no success, redirect to thanks screen
        if (data.success === false) {
            window.location.href = routes.thanks;
        }
    });

    socket.on("rcv.display-disconnect", function() {
        // no display connected or disconnected, redirect to thanks screen
        window.location.href = routes.thanks;
    });

})(jQuery);
