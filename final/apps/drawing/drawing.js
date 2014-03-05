/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    05.03.14
 */

(function($){

    var canvas,
        context;

    var lastDrawingCoordinate;

    function init () {
        canvas = document.getElementById('fullscreen-canvas');
        canvas.width = 2000;//window.innerWidth;
        canvas.height = 2000;//window.innerHeight;


        context = canvas.getContext('2d');

    }



    $(document).ready(function () {
        init ();
    });

    $(document).on('onIdle', function () {
        lastDrawingCoordinate = null;
    });

    $(document).on('onFirstTouchOnly', function () {
        lastDrawingCoordinate = null;
    });

    $(document).on('onDrag', function (event) {

        var coordinates = Matrix.screenToWorld(event.customData.activeTouch.pageX, event.customData.activeTouch.pageY);

        var $wrapper = $('#wrapper');

        //coordinates.x *= window.innerWidth / $(canvas).width();
        //coordinates.y *= window.innerHeight / $(canvas).height();

        if(!lastDrawingCoordinate) {

            lastDrawingCoordinate = coordinates;
            return;
        }

        context.fillStyle = 'rgba(255,255,255,0.01)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.strokeStyle = 'red';
        context.beginPath();
        context.moveTo(lastDrawingCoordinate.x, lastDrawingCoordinate.y);
        context.lineTo(coordinates.x, coordinates.y);

        context.stroke();

        lastDrawingCoordinate = coordinates;



    });


})(jQuery);