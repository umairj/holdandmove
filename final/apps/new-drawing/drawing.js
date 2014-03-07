(function ($, OS) {

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




    function DrawingApp () {}

    DrawingApp.prototype = new OS.Application();

    $.extend(DemoApp.prototype, {

        canvas: null,

        context: null,

        $wrapper: null,

        init: function () {

            this.canvas = document.getElementById('fullscreen-canvas');
            this.canvas.width = 2000;//window.innerWidth;
            this.canvas.height = 2000;//window.innerHeight;


            this.context = canvas.getContext('2d');

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
        },

        unInit: function() {
            if(!!OS.plugins.mobileRestore) {
                OS.plugins.mobileRestore.deactivate();
            }
        },

        registerEvents: function () {
            var that = this;



        }
    });

    var drawingApp = new DrawingApp();

    drawingApp.install();

})(jQuery, window.OS);