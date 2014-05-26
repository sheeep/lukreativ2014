(function($) {

    // connect to socket
    var socket = io.connect(location.origin);

    socket.on("rcv.register-controller", function(data) {
        alert(data.id);
    })

    socket.emit("snd.register-controller");

})(jQuery);