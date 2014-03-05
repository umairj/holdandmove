/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    05.03.14
 */

(function($){

    var canvas,
        context;

    function init () {
        canvas = document.getElementById('fullscreen-canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context = canvas.getContext('2d');
    }



    $(document).ready(function () {
        init ();
    });

    $(document).on('onDrag', function (event) {


        var offset = Matrix.getTranslation();
        var scale = Matrix.getScale();

        var x = (event.customData.activeTouch.pageX - offset.x) / scale,
            y = (event.customData.activeTouch.pageY - offset.y) / scale;


        context.fillStyle = 'rgba(255,255,255,0.01)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'red';
        context.beginPath();
        context.arc(x, y, 10, 0, Math.PI * 2);
        context.fill();

    });


})(jQuery);