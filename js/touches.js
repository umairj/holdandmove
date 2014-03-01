/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    28.02.14
 */


(function($) {

    /*$(window).on('hm.start', function () {

    });*/

    $(window).bind("gesturechange", function(event) {

        var scale = event.originalEvent.scale;

        alert(scale);
    });

})(jQuery);