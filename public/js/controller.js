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

    var playerColor = null;

    // connect to socket
    var socket = io.connect(location.origin);
    var startable = false;

    socket.on("connect", function() {
        // register as controller
        socket.emit("snd.register-controller");

        $(".btn:not(#start)").on("touchstart", function(event) {
            var id = $(this).attr("class").split(" ")[0];

            event.preventDefault();

            socket.emit("snd.controller-data", {
                direction: direction[id]
            });

            return false;
        });

        $(".exit").on("click", function(event) {
            window.location.href = routes.thanks;
        });

        $(".start").on("click", function(event) {
            if (!startable) {
                return;
            }

            socket.emit("snd.game-start");
        });
    });

    socket.on("rcv.game-started", function() {
        $(".start").fadeOut();
    });

    socket.on("rcv.startable", function(bool) {
        if (bool === true) {
            $(".start").fadeIn();
        }

        if (bool === false) {
            $(".start").fadeOut();
        }

        startable = bool;
    });

    socket.on("rcv.register-controller", function(data) {
        // no success, redirect to thanks screen
        if (false === data.success) {
            window.location.href = routes.thanks;
            return;
        }

        var playerColor = data.color;
        var dColor = lightenDarkenColor(playerColor, -30);

        $(".btn-primary").css({
            "background-color": playerColor,
            "border-color": dColor
        });
    });

    socket.on("rcv.display-disconnect", function() {
        // no display connected or disconnected, redirect to thanks screen
        window.location.href = routes.thanks;
    });

    // TODO: For developer sanity purposes only.
    $(document).keydown(function(e){

        switch (e.keyCode) {
            case 37:
                $(".left").trigger("touchstart");
                break;
            case 38:
                $(".up").trigger("touchstart");
                break;
            case 39:
                $(".right").trigger("touchstart");
                break;
            case 40:
                $(".down").trigger("touchstart");
                break;
        }
    });

    $(document).ready(function(){
        initialize();
    });

    $(window).resize(function(){
        initialize();
    });

})(jQuery);

var initialize = function() {
    var orientation = window.orientation;
    var h, leftH, rightH;

    if (orientation != 0) {
        $("#wrapper-landscape").addClass("active");
        $("#wrapper-portrait").removeClass("active");

        leftH  = $(".left.row").height();
        rightH = $(".right.row").height();

        $("#wrapper-landscape .left.row .btn i").css("line-height", leftH + "px");
        $("#wrapper-landscape .right.row .btn i").css("line-height", rightH + "px");

    } else {
        $("#wrapper-portrait").addClass("active");
        $("#wrapper-landscape").removeClass("active");

        h = $("#wrapper-portrait .row").height();

        $("#wrapper-portrait .btn i").css("line-height", h * 0.9 + "px");
    }
};

var lightenDarkenColor = function(col, amt) {

    var usePound = false;

    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col,16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if (b > 255) b = 255;
    else if  (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);

};

document.ontouchmove = function(event){
    event.preventDefault();
};

// Listen for orientation changes
window.addEventListener("orientationchange", function() {
    initialize();
}, false);
