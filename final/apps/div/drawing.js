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


        canvas.parentNode.width = canvas.width;
        canvas.parentNode.height = canvas.height;
        canvas.parentNode.style.width = canvas.width + 'px';
        canvas.parentNode.style.height = canvas.height + 'px';
        context = canvas.getContext('2d');

    }


    function distanceSquared (x1, y1, x2, y2) {
        return (x1-x2) * (x1-x2) + (y1-y2) * (y1-y2);
    }

    function Pen (param) {
        this.id = Pen.pens.length;
        Pen.pens.push(this);
        $.extend(this, param);
    }

    Pen.pens = [];

    Pen.drawAll = function () {
        Pen.pens.forEach(function (pen) {
            pen.draw();
        });
    };

    Pen.prototype = {
        id: -1,
        position: {
            x: 0,
            y: 0
        },
        color: 'black',
        size: 3,

        remove: function () {
            Pen.pens.splice(this.id, 1);
        },

        draw: function () {
            context.beginPath();
            context.strokeStyle = 'rgba(0,0,0,0.05)';
            context.fillStyle = this.color;
            context.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        }
    };

    function getPenAtPoint (x, y) {
        var minPen = null;
        var minDistance = 99999999;
        Pen.pens.forEach(function(pen) {
            var dist = distanceSquared(pen.position.x, pen.position.y, x, y);
            if(dist < minDistance && dist < pen.size * pen.size) {
                minPen = pen;
                minDistance = dist;
            }
        });
        return minPen;
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