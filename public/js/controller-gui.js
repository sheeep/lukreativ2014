(function($) {
    $(document).ready(function(){
        var h = $('.row').height();

        $('.btn i').css('line-height', h * 0.8 + 'px');
    });

    $(document).resize(function(){
        var h = $('.row').height();

        $('.btn i').css('line-height', h * 0.8 + 'px');
    });
})(jQuery);
