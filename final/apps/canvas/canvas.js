/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    06.03.14
 */

(function($){

    var canvas,
        context;

    $(document).ready(function () {
        canvas = document.getElementById('fullscren-canvas');
        context = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

})(jQuery);