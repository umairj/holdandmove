/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    01.03.14
 */

(function () {

    //////      MATRIX      /////////////////////////

    var matrix = [1,0,0,0,  0,1,0,0, 0,0,1,0, 0,0,0,1];

    function translate(matrix, a, b) {
        matrix[12] += a;
        matrix[13] += b;
    }

    function scale(matrix, a) {
        /*for(var i=0; i<matrix.length; i++) {
            matrix[i] *= a;
        }*/
        matrix[0] *= a;
        matrix[5] *= a;
        matrix[12] *= a;
        matrix[13] *= a;
    }

    function product(A, B) {
        A[0] *= B[0];
        A[5] *= B[5];
        A[10] *= B[10];
        A[12] = B[0] * A[12] + B[12];
        A[13] = B[5] * A[13] + B[13];
    }

    function reduce(matrix) {
        return [matrix[0], 0,   0, matrix[5],   matrix[12], matrix[13]];
    }

    function applyToElement(matrix, elem, opengl) {
        if(opengl) {
            elem.style.webkitTransform = "matrix3d(" + matrix.join(',') + ")";
        }
        else {
            var reducedMatrix = reduce(matrix);
            elem.style.webkitTransform = "matrix(" + reducedMatrix.join(',') + ")";
        }

        elem.style.webkitTransformOrigin = "0px 0px";
    }

    function vectorLength(x, y) {
        return x*x + y*y;
    }



    //////      CANVAS      /////////////////////////

    var canvas = null,
        context = null,

        points = [],
        pointCount = 100;

    function createCanvas() {
        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');
        document.body.appendChild(canvas);

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.classList.add('fullscreen');

    }

    function createWorld () {
        for(var i=0; i<pointCount; i++) {
            points.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            });
        }
    }

    function drawWorld () {

        // get translation
        var translation = {
            x: matrix[12],
            y: matrix[13]
        };

        // get scale
        var scale = matrix[0];

        context.clearRect(0, 0, canvas.width, canvas.height);

        for(var i=0; i<pointCount; i++) {
            var point = points[i];
            context.fillStyle = 'blue';
            context.beginPath();
            context.arc(point.x * scale + translation.x, point.y * scale + translation.y, 10, 0, Math.PI * 2);
            context.fill();

        }
    }



    //////      ANIMATION      /////////////////////////

    var stopAnimation = false;

    function animateTranslation(matrix, velocity, elem) {
        var oldTime = 0;
        var callback = function (timestamp) {

            if(stopAnimation) {
                stopAnimation = true;
                return;
            }

            var factor = 1;
            var deltaTime = oldTime - timestamp;

            if(oldTime == 0) {
                deltaTime = 1;
            }

            translate(matrix, factor * velocity[0] * deltaTime, factor * velocity[1] * deltaTime);

            applyToElement(matrix, elem, true);
            drawWorld();

            velocity[0] *= 0.95;
            velocity[1] *= 0.95;

            if(vectorLength(velocity[0], velocity[1]) > .01) {
                window.requestAnimationFrame(callback);
            }
        };
        window.requestAnimationFrame(callback);
    }

    function animateScale(matrix, velocity, originX, originY, elem) {
        var callback = function () {

            if(stopAnimation) {
                stopAnimation = true;
                return;
            }


            translate(matrix, -originX, -originY);
            scale(matrix, 1 + velocity * 10);
            translate(matrix, originX, originY);

            applyToElement(matrix, elem);
            drawWorld();

            velocity *= 0.4;

            if(Math.abs(velocity) > .00001) {
                window.setTimeout(callback,10);
            }
        };
        window.requestAnimationFrame(callback,10);
    }

    window.addEventListener('load', function () {
        var elem = document.getElementById('test');


        createCanvas();
        createWorld();

        drawWorld();
        applyToElement(matrix, elem);




    });


    var focusX = 0,
        focusY = 0,
        oldMouseX = 0,
        oldMouseY = 0,
        oldTouches=[],

        aggregatedVelocity = [0,0],
        measurePoints = 0,

        velocity = [0,0],
        lastTimeStamp = 0,
        mouse = false;


    window.addEventListener('touchstart', function(event) {
        var touches = event.touches;
        mouse = true;
        lastTimeStamp = event.timeStamp;
        aggregatedVelocity[0] = 0;
        aggregatedVelocity[1] = 0;

        if(touches.length == 1) {
            oldMouseX = touches[0].pageX;
            oldMouseY = touches[0].pageY;
        } else if(touches.length == 2) {
            oldMouseX = (touches[0].pageX + touches[1].pageX) / 2;
            oldMouseY = (touches[0].pageY + touches[1].pageY) / 2;
        }

        for(var i=0; i<touches.length; i++) {
            oldTouches[i] = {
                x: touches[i].pageX,
                y: touches[i].pageY
            };
        }

        stopAnimation = true;
    });

    window.addEventListener('touchmove', function (event) {

        event.preventDefault();

        var elem = document.getElementById('test');
        var debug = document.getElementById('debug');
        var touches = event.touches;


        if(touches.length == 1) {
            focusX = touches[0].pageX;
            focusY = touches[0].pageY;
        } else if(touches.length == 2) {
            focusX = (touches[0].pageX + touches[1].pageX) / 2;
            focusY = (touches[0].pageY + touches[1].pageY) / 2;

        }




        if(mouse && touches.length == 1) {
            translate(matrix, focusX - oldMouseX, focusY - oldMouseY);
            applyToElement(matrix, elem, true);

            var deltaTime = event.timeStamp - lastTimeStamp;
            if(deltaTime > 0) {
                aggregatedVelocity[0] += (focusX - oldMouseX);
                aggregatedVelocity[1] += (focusY - oldMouseY);
                measurePoints += 1;
            }

        } else if (mouse && touches.length == 2) {
            var distNew = vectorLength(touches[0].pageX - touches[1].pageX, touches[0].pageY - touches[1].pageY);
            var distOld = vectorLength(oldTouches[0].x - oldTouches[1].x, oldTouches[0].y - oldTouches[1].y);

            var f = Math.sqrt(distNew / distOld);

            translate(matrix, -focusX, -focusY    );
            scale(matrix, f);
            translate(matrix, focusX, focusY);
            translate(matrix, focusX - oldMouseX, focusY - oldMouseY);
            applyToElement(matrix, elem, true);

        }



        oldMouseX = focusX;
        oldMouseY = focusY;

        lastTimeStamp = event.timeStamp;

        for(var i=0; i<touches.length; i++) {
            oldTouches[i] = {
                x: touches[i].pageX,
                y: touches[i].pageY
            };
        }

        drawWorld();

    });

    window.addEventListener('touchend', function (event) {

        var elem = document.getElementById('test');

        mouse = false;

        focusX = event.pageX;
        focusY = event.pageY;

        stopAnimation = false;

        velocity[0] = aggregatedVelocity[0] / measurePoints;
        velocity[1] = aggregatedVelocity[1] / measurePoints;

        animateTranslation(matrix, velocity, elem);
        applyToElement(matrix, elem);

        oldTouches = touches;
    });

    window.addEventListener('mousedown', function (event) {
        mouse = true;
        oldMouseX = event.pageX;
        oldMouseY = event.pageY;
        lastTimeStamp = event.timeStamp;
        velocity[0] = 0;
        velocity[1] = 0;
    });

    window.addEventListener('mouseup', function (event) {

        var elem = document.getElementById('test');

        mouse = false;

        focusX = event.pageX;
        focusY = event.pageY;

        animateTranslation(matrix, velocity, elem);
        applyToElement(matrix, elem, false);
    });

    window.addEventListener('mousemove', function (event) {
        var elem = document.getElementById('test');

        focusX = event.pageX;
        focusY = event.pageY;






        if(mouse) {
            translate(matrix, focusX - oldMouseX, focusY - oldMouseY);
            applyToElement(matrix, elem, true);
            velocity[0] = /*velocity[0] * 0.9  + */10*(focusX - oldMouseX) / (event.timeStamp - lastTimeStamp);
            velocity[1] = /*velocity[1] * 0.9  + */10*(focusY - oldMouseY) / (event.timeStamp - lastTimeStamp);
        }
        oldMouseX = event.pageX;
        oldMouseY = event.pageY;
        lastTimeStamp = event.timeStamp;

        drawWorld();
    });

    window.addEventListener('mousewheel', function (event) {

        event.preventDefault();

        var elem = document.getElementById('test');

        var f = event.wheelDelta / 100000;

        translate(matrix, -focusX, -focusY    );
        scale(matrix, f);
        translate(matrix, focusX, focusY);

        //animateScale(matrix, f, focusX, focusY, elem);






        applyToElement(matrix, elem, false);

        drawWorld();

    });



})();