(function($) {
    $(document).ready(function(){
        var h = $('.row').height();

        $('.btn i').css('line-height', h * 0.8 + 'px');
    });

    $(window).resize(function(){
        var h = $('.row').height();

        $('.btn i').css('line-height', h * 0.8 + 'px');
    });
})(jQuery);
