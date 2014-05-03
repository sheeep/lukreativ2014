(function($) {

    // connect to socket
    var socket = io.connect(location.origin);

    socket.emit("register-display");

    socket.on("controller-registered", function(data) {
        document.write("a controller registered<br />");
    })

    socket.on("controller-data", function(data) {
        document.write("controller pressed a button<br />");
    });

})(jQuery);