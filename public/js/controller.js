(function($) {

    var direction = {
        left:   1,
        right:  2,
        up:     3,
        down:   4
    };

    var routes = {
        "thanks": "/thanks"
    };

    // connect to socket
    var socket = io.connect(location.origin);

    socket.on("connect", function() {
        // register as controller
        socket.emit("snd.register-controller");

        $(".button").on("click doubleclick", function(event) {
            var id = $(this).attr('id');

            event.preventDefault();

            if ("exit" === id) {
                window.location.href = routes.thanks;
                return false;
            }

            socket.emit("snd.controller-data", {
                direction: direction[$(this).attr('id')]
            });

            return false;
        });
    });

    socket.on("rcv.register-controller", function(data) {
        // no success, redirect to thanks screen
        if (false === data.success) {
            window.location.href = routes.thanks;
        }
    });

    socket.on("rcv.display-disconnect", function() {
        // no display connected or disconnected, redirect to thanks screen
        window.location.href = routes.thanks;
    });

})(jQuery);

document.ontouchmove = function(event){
    event.preventDefault();
}
