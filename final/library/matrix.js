/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    01.03.14
 */

var Matrix = (function () {

    //////      MATRIX      /////////////////////////

    var matrix = [1,0,0,0,  0,1,0,0, 0,0,1,0, 0,0,0,1];
	var inverse = [1,0,0,0,  0,1,0,0, 0,0,1,0, 0,0,0,1];
	
	var lastElement = null;

    function translate(matrix, inverse, a, b) {
        matrix[12] += a;
        matrix[13] += b;
		inverse[12] -= a;
        inverse[13] -= b;
    }

    function scale(matrix, inverse, a) {
        /*for(var i=0; i<matrix.length; i++) {
            matrix[i] *= a;
        }*/
        matrix[0] *= a;
        matrix[5] *= a;
        matrix[12] *= a;
        matrix[13] *= a;
		
		if(a == 0)
			return;
		
		inverse[0] /= a;
        inverse[5] /= a;
        inverse[12] /= a;
        inverse[13] /= a;
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

    function applyToElement(matrix, elem, opengl, origin) {
        if(opengl) {
            elem.style.webkitTransform = "matrix3d(" + matrix.join(',') + ")";
        }
        else {
            var reducedMatrix = reduce(matrix);
            elem.style.webkitTransform = "matrix(" + reducedMatrix.join(',') + ")";
        }

		if(!origin)
			elem.style.webkitTransformOrigin = "0px 0px";
		else
			elem.style.webkitTransformOrigin = origin.x + "px " + origin.y + "px";
    }

    function vectorLength(x, y) {
        return x*x + y*y;
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



    return {

        reset: function () {
            matrix = [1,0,0,0,  0,1,0,0, 0,0,1,0, 0,0,0,1];
        },

        getMatrix: function () {
            return matrix;
        },

        getTranslation: function () {
            return {
                x: matrix[12],
                y: matrix[13]
            }
        },

        getScale: function () {
            return matrix[0];
        },

        scale: function (factor) {
          scale(matrix, inverse, factor);
        },

        translate: function (a, b) {
            translate(matrix, inverse, a, b);
        },

        applyToElement: function (elem, opengl) {
			lastElement = elem;
            applyToElement(matrix, elem, opengl);
        },
		
		resetElement: function(elem, parent, position, opengl) {
			
			var offset = {x: parent.offsetLeft - elem.offsetLeft, y: parent.offsetTop - elem.offsetTop};
			
			var translation = this.getTranslation();
			var scale = this.getScale();
			var origin = this.screenToWorld(offset.x, offset.y);
			elem.style.webkitTransform = "scale(" + 1/scale + ") translate(" + (offset.x - translation.x + position.x - parent.offsetLeft) + "px, " + (offset.y - translation.y + position.y - parent.offsetTop) + "px) ";
			
			//applyToElement(inverse, elem, opengl, offset);
			elem.style.webkitTransformOrigin = offset.x + "px " + offset.y + "px";
			//elem.style.webkitTransform += "scale(2)";
			return offset;
		},

        screenToWorld: function(sx, sy) {
            var translation = this.getTranslation();
            var scale = this.getScale();
            return {
                x: (sx - translation.x) / scale,
                y: (sy - translation.y) / scale
            }
        },
		
		worldToScreen: function (wx, wy) {
			var translation = this.getTranslation();
            var scale = this.getScale();
            return {
                x: wx * scale + translation.x,
                y: wy * scale + translation.y,
            }
		}

    };

    /*window.addEventListener('load', function () {
        var elem = document.getElementById('test');


        createCanvas();
        createWorld();

        drawWorld();
        applyToElement(matrix, elem);




    });*/


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


    /*window.addEventListener('touchstart', function(event) {
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
    });*/

    /*window.addEventListener('touchmove', function (event) {

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

    });*/

    /*window.addEventListener('touchend', function (event) {

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
    });*/

    /*window.addEventListener('mousemove', function (event) {
        var elem = document.getElementById('test');

        focusX = event.pageX;
        focusY = event.pageY;






        if(mouse) {
            translate(matrix, focusX - oldMouseX, focusY - oldMouseY);
            applyToElement(matrix, elem, true);
            velocity[0] = 10*(focusX - oldMouseX) / (event.timeStamp - lastTimeStamp);
            velocity[1] = 10*(focusY - oldMouseY) / (event.timeStamp - lastTimeStamp);
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

    });*/



})();