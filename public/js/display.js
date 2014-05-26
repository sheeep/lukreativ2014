(function($) {

    // connect to socket
    var socket = io.connect(location.origin);
    var stage = null;

    socket.on("rcv.register-display", function(data) {
        if (!data.success) alert("Whoops..!");
        var id = data.id;

        socket.emit("snd.state");
    });

    socket.on("rcv.state", function(data) {
        stage = data;
    });

    // connect to server
    socket.emit("snd.register-display");

    setInterval(function() {
        alert(stage);
    }, 10000);
})(jQuery);