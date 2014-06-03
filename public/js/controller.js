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

        $(".btn:not(#exit)").on("touchstart", function(event) {
            var id = $(this).attr('id');

            event.preventDefault();

            socket.emit("snd.controller-data", {
                direction: direction[id]
            });

            return false;
        });

        $("#exit.btn").on("click", function(event) {
            var r = confirm("Do you really wanna leave this epic game?");

            if (true === r) {
                window.location.href = routes.thanks;
                return false;
            }
        });

        $("#start.btn").on("click", function(event) {
            socket.emit("snd.game-start");
        });
    });

    socket.on("rcv.game-started", function() {
        $("#start.btn").fadeOut();
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

    // TODO: For developer sanity purposes only.
    $(document).keydown(function(e){

        switch (e.keyCode) {
            case 37:
                $('#left').trigger("touchstart");
                break;
            case 38:
                $('#up').trigger("touchstart");
                break;
            case 39:
                $('#right').trigger("touchstart");
                break;
            case 40:
                $('#down').trigger("touchstart");
                break;
        }
    });

})(jQuery);

document.ontouchmove = function(event){
    event.preventDefault();
}
