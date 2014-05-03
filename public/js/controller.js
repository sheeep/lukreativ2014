(function($) {

    // connect to socket
    var socket = io.connect(location.origin);

    socket.emit("register-controller");

    $(document).ready(function() {
        $('body button').click(function() {
            socket.emit("controller-data");
        });
    });

})(jQuery);