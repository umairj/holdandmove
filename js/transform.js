(function() {
    var canvas = null,
        context = null;

    var elem;

    var translation = {x: 0, y: 0},
        scale = 1,
        origin = {x: 0, y: 0};

    var oldTouches = [];

    var originOffset = {x: 0, y: 0};

    var worldPoints = [];

    var keyState = 0;

    function drawGrid (gridsize) {
        gridsize = gridsize || 50;

        for(var x=gridsize/2; x<canvas.width; x+=gridsize) {
            drawLine(x, 0, x, canvas.height);
            drawText(x, x, gridsize/4);

        }
        for(var y=gridsize/2; y<canvas.height; y+=gridsize) {
            drawLine(0, y, canvas.width, y);
            drawText(y, gridsize/4, y);
        }
    }

    function drawText (text, px, py, size) {
        size = size || 10;
        context.fillStyle = 'green';
        context.font = size + "px Arial";
        context.fillText(text, px, py);
    }

    function drawLine (x1, y1, x2, y2) {
        context.strokeStyle = 'silver';
        context.beginPath();
        context.moveTo(x1,y1);
        context.lineTo(x2,y2);
        context.stroke();
    }

    function drawPoint (px, py) {
        context.beginPath();
        context.arc(px, py, 20, 0, Math.PI * 2);
        context.fill();
    }

    function resizeCanvas () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function clearCanvas () {
        context.clearRect(0,0,canvas.width,canvas.height);
    }

    function toScreen(p) {
        p.x = (p.x + translation.x - origin.x) * scale + origin.x ;
        p.y = (p.y + translation.y - origin.y) * scale + origin.y ;
    }

    function distanceSquared (x1, y1, x2, y2) {
        return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
    }

    function translate (ox, oy, nx, ny) {
        origin.x = nx + originOffset.x;
        origin.y = ny + originOffset.y;
        translation.x += nx - ox;
        translation.y += ny - oy;
    }

    function updateOrigin(x1, y1, x2, y2) {
        if(!x2 || !y2) {
            origin.x = x1;
            origin.y = y1;
        } else {
            origin.x = (x1 + x2) / 2;
            origin.y = (y1 + y2) / 2;
        }

    }

    function transform(ox1, oy1, ox2, oy2, nx1, ny1, nx2, ny2) {
        // translation is the movement of the barycenter
        translation.x += ((nx1 - ox1) + (nx2 - ox2)) / 2;
        translation.y += ((ny1 - oy1) + (ny2 - oy2)) / 2;

        origin.x = (nx1 + nx2) /2;
        origin.y = (ny1 + ny2) /2;

        // scale is the sqrt of the quotient of the distances

        var newDistance = distanceSquared(nx1, ny1, nx2, ny2);
        var oldDistance = distanceSquared(ox1, oy1, ox2, oy2);

        if(oldDistance > 0)
            scale *= Math.sqrt(newDistance / oldDistance);
    }

    function createWorld(numberOfParticles) {
        numberOfParticles = numberOfParticles || 100;

        for(var i=0; i<numberOfParticles; i++) {
            worldPoints.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
            })

        }
    }

    function drawWorld() {
        worldPoints.forEach(function (point) {

            var pointCopy = {x: point.x, y: point.y};
            toScreen(pointCopy);
            context.fillStyle = 'green';
            drawPoint(pointCopy.x, pointCopy.y);
            //toWorld(point);
        });


    }

    function drawOrigin() {
        var point = {
            x: origin.x,
            y: origin.y
        };
        //toWorld(point);
        context.fillStyle = 'blue';
        drawPoint(point.x, point.y);
    }

    function matrixMultiply(mat1, mat2) {
        return [
            mat1[0] * mat2[0],
            0,

            0,
            mat1[3] * mat2[3],

            mat1[0] * mat2[4] + mat1[4],
            mat1[0] * mat2[5] + mat1[5]
        ];
    }

    function applyToDocument () {

        var str = "";

        var translationMatrix = [
            1, 0,
            0, 1,
            translation.x, translation.y
        ];

        var inverseTranslationMatrix = [
            1, 0,
            0, 1,
            -translation.x, -translation.y
        ];

        var scaleMatrix = [
            scale, 0,
            0, scale,
            0, 0
        ];

        var inverseScaleMatrix = [
            1 / scale, 0,
            0, 1 / scale,
            0, 0
        ];

        var originMatrix = [
            1, 0,
            0, 1,
            origin.x, origin.y
        ];

        var inverseOriginMatrix = [
            1, 0,
            0, 1,
            -origin.x, -origin.y
        ];

        var resultMatrix = matrixMultiply(scaleMatrix,originMatrix);
        resultMatrix = matrixMultiply(inverseOriginMatrix,resultMatrix);
        //resultMatrix = matrixMultiply(translationMatrix, resultMatrix);
        //resultMatrix = matrixMultiply(inverseScaleMatrix,resultMatrix);
        /*resultMatrix = matrixMultiply(resultMatrix, originMatrix);*/

        console.log(translation)
        console.log(resultMatrix);

        str += "translate(" + (-origin.x) + "px, " + (-origin.y) + "px)";

        str = "matrix(" + resultMatrix.join(',') + ")";
        elem = elem || document.getElementById('wrapper');
        elem.style.webkitTransform = str;//"scale(" + scale + ")";// translate(" + translation.x + "px, " + translation.y + "px)";
        //elem.style.webkitTransformOrigin = origin.x + 'px ' + origin.y + 'px';
    }

    function render () {
        //resizeCanvas();
        clearCanvas();
        drawGrid(50);
        drawOrigin();
        applyToDocument();
        drawWorld();
    }

    window.addEventListener('load', function () {
        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');

        document.body.appendChild(canvas);

        resizeCanvas();
        canvas.classList.add('fullscreen');

        createWorld(10);

        render();
    });

    window.addEventListener('resize', render);

    window.addEventListener('keydown', function (event) {
        switch(event.keyCode) {
            case 89:
                keyState = 1;
                break;
            case 88:
                keyState = 2;
                break;
        }
    });

    window.addEventListener('keyup', function (event) {
        keyState = 0;
        scale *= 1.01;
        render();
    });

    window.addEventListener('mousemove', function (event) {


    });


    window.addEventListener('touchstart', function (event) {
        oldTouches = event.touches;

        var touches = event.touches;

        render();

        for(var i=0; i< touches.length; i++) {
            var touch = touches[i];
            context.fillStyle = 'red';
            drawPoint(touch.pageX, touch.pageY);
        }

        /*if(touches.length == 1) {
            updateOrigin(touches[0].pageX + originOffset.x, touches[0].pageY + originOffset.y);
        }*/
        if(touches.length == 2) {
            updateOrigin(touches[0].pageX, touches[0].pageY, touches[1].pageX, touches[1].pageY);
        }
    });


    window.addEventListener('touchmove', function (event) {
        var touches = event.touches;

        event.preventDefault();




        if(touches.length == 1) {
            //updateOrigin(touches[0].pageX + originOffset.x, touches[0].pageY + originOffset.y);
            translate(oldTouches[0].pageX, oldTouches[0].pageY,touches[0].pageX, touches[0].pageY);
        } else if(touches.length == 2) {
            updateOrigin(touches[0].pageX, touches[0].pageY, touches[1].pageX, touches[1].pageY);
            transform(oldTouches[0].pageX, oldTouches[0].pageY, oldTouches[1].pageX, oldTouches[1].pageY,
            touches[0].pageX, touches[0].pageY, touches[1].pageX, touches[1].pageY);
        }

        render();

        for(var i=0; i< touches.length; i++) {
            var touch = touches[i];
            context.fillStyle = 'red';
            drawPoint(touch.pageX, touch.pageY);
        }

        oldTouches = event.touches;



    });


    window.addEventListener('touchend', function (event) {
        var touches = event.touches;

        event.preventDefault();

        render();

        for(var i=0; i< touches.length; i++) {
            var touch = touches[i];
            context.fillStyle = 'red';
            drawPoint(touch.pageX, touch.pageY);
        }

        if(touches.length == 1) {
            originOffset.x = origin.x - touches[0].pageX;
            originOffset.y = origin.y - touches[0].pageY;
        } else if(touches.length == 0) {
            originOffset.x = 0;
            originOffset.y = 0;
            translation.x += (1/scale-1)*origin.x;
            translation.y += (1/scale-1)*origin.y;
            origin.x=0;
            origin.y=0;
        }

        oldTouches = event.touches;

        console.log(translation);
        console.log(origin);
        console.log(originOffset);



    });


})();


/*
(function () {

    function transform(elem, matrix) {
        var str = "matrix(" + matrix.join(',') + ")";
        console.log(str);
        $(elem).css('-webkit-transform', str);
    }

    window.addEventListener('load', function () {
        var matrix = [1,0,0,1,1,0];
        var elem = document.getElementById('wrapper');

        transform(elem, matrix);
    });
})();
*/
