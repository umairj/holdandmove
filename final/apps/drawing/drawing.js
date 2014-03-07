/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    05.03.14
 */

(function($){

    var canvas,
        context;

    var lastDrawingCoordinate = null,
        activePen = null;

    function init () {
        canvas = document.getElementById('fullscreen-canvas');
        canvas.width = 2000;//window.innerWidth;
        canvas.height = 2000;//window.innerHeight;


        context = canvas.getContext('2d');

    }





    $(document).ready(function () {
        init ();

        new Pen({
            position: {
                x: Math.random() * 1000,
                y: Math.random() * 1000
            },
            color: 'rgba(0,0,255,0.6)',
            size: 50
        });

        new Pen({
            position: {
                x: Math.random() * 1000,
                y: Math.random() * 1000
            },
            color: 'rgba(0,255,0,0.6)',
            size: 30
        });

        new Pen({
            position: {
                x: Math.random() * 1000,
                y: Math.random() * 1000
            },
            color: 'rgba(255,0,0,0.6)',
            size: 70
        });

        Pen.drawAll();
    });



    $(document).on('onIdle', function () {
        lastDrawingCoordinate = null;
        activePen = null;
    });

    $(document).on('onFirstTouchOnly', function () {
        lastDrawingCoordinate = null;
        activePen = null;
    });

    $(document).on('onDrag', function (event) {

        var coordinates = Matrix.screenToWorld(event.customData.activeTouch.pageX, event.customData.activeTouch.pageY);

        if(!activePen)
            activePen = getPenAtPoint(coordinates.x, coordinates.y);

        if(activePen) {
            activePen.position = coordinates;
            activePen.draw();
        }

        Pen.drawAll();



        var $wrapper = $('#wrapper');

        //coordinates.x *= window.innerWidth / $(canvas).width();
        //coordinates.y *= window.innerHeight / $(canvas).height();

        if(!lastDrawingCoordinate) {

            lastDrawingCoordinate = coordinates;
            return;
        }

        context.fillStyle = 'rgba(255,255,255,0.01)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.lineWidth = 20 / Matrix.getScale();
        context.strokeStyle = 'rgba(0,0,0,0.2)';
        context.beginPath();
        context.moveTo(lastDrawingCoordinate.x, lastDrawingCoordinate.y);
        context.lineTo(coordinates.x, coordinates.y);

        context.stroke();

        lastDrawingCoordinate = coordinates;



    });


})(jQuery);