/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    27.02.14
 */


(function ($, global){

    var debugConsole = null,
        debugCanvas = null,
        debugCanvasContext = null,
        hidden = true;

    $(window).bind('load', function () {
        debugConsole = document.createElement('div');
        debugCanvas = document.createElement('canvas');

        debugCanvas.width = window.innerWidth;
        debugCanvas.height = window.innerHeight;

        debugCanvasContext = debugCanvas.getContext('2d');


        document.body.appendChild(debugCanvas);
        document.body.appendChild(debugConsole);

        debugConsole.classList.add('debug-console');
        debugCanvas.classList.add('debug-canvas');

        $(debugConsole).bind('mousedown touchstart', function () {
            hidden = !hidden;
            console.log('yo');
            if(hidden)
                hide();
            else
                show();
        });



        global.Debug = global.Debug || {};
        global.Debug.out = debug;
        global.Debug.clear = clear;
        global.Debug.hide = hide;
        global.Debug.show = show;

        global.Debug.draw = draw;

        hide();

    });

    function draw (px1, py1, px2, py2) {
        var ctx = debugCanvasContext;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();
    }

    function hide () {
        debugConsole.classList.add('debug-hidden');
    }

    function show() {
        debugConsole.classList.remove('debug-hidden');
    }

    function debug (message) {
        if(typeof message == 'object') {
            debugConsole.innerHTML = '<p>' + JSON.stringify(message); //;+ '</p>' + debugConsole.innerHTML;
        }  else {
            debugConsole.innerHTML = '<p>' + message + '</p>'; //;+ debugConsole.innerHTML;
        }
    }

    function clear() {
        debugConsole.innerHTML = '';
    }


})(jQuery, window);

(function ($) {

    function time() {
        return (new Date).getTime();
    }

    function calculateDistance(x1, y1, x2, y2) {

        var dx = x2 - x1,
            dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    function filterTouches(touches) {

        var result = {activeTouch: null, originTouch: null};
        var minDistance = 99999999;


        for(var i=0; i<touches.length; i++) {


            var touch = touches[i];

            var distance = calculateDistance(touch.pageX, touch.pageY, originPoint.x, originPoint.y);
            if(distance < distanceThreshold) {
                result.originTouch = touch;
                minDistance = distance;
            } else {
                result.activeTouch = touch;
            }
        }

        /*if(touches.length == 1) {
            var touch = touches[0];
            var distance = calculateDistance(touch.pageX, touch.pageY, originPoint.x, originPoint.y);
            if(distance < distanceThreshold) {
                result.originTouch = touch;
                minDistance = distance;
            } else {
                result.activeTouch = touch;
            }
        }

        if(result.originTouch == null) {
            holdActive = false;
        }*/


        return result;
    }

    var activeTouchCount = 0;
    var timeThreshold = 200; // ms
    var distanceThreshold = 100; // squared pixels
    var initTime = 0;

    var holdActive = false;

    var originPoint = null;
    var relativePoint = {x: 0, y:0};
    var lastRelativePoint = {x: 0, y:0};

    window.setInterval(function() {
        showActiveState();
    }, 10);

    function showActiveState () {
        var str = '';
        if(holdActive) {
            str += "active<br/>"
        } else {
            str += "inactive <br/>";
        }

        str += JSON.stringify(relativePoint) + '<br/>';



        str += activeTouchCount + "<br/>";
        Debug.out(str);
    }

    function onHoldAndMoveStart (e) {

        holdActive = true;


    }

    function onHoldAndMoveMove (e) {

        Debug.draw(lastRelativePoint.x, lastRelativePoint.y, relativePoint.x, relativePoint.y);
    }

    function onHoldAndMoveStop (e) {

        holdActive = false;
        Debug.draw(lastRelativePoint.x, lastRelativePoint.y, relativePoint.x, relativePoint.y);

    }

    $(window).bind('touchstart', function (e) {

        //Debug.out('touchstart');

        var touches = e.originalEvent.touches;
        var time = e.originalEvent.timeStamp;

        if(activeTouchCount < 5)
            activeTouchCount+=e.originalEvent.changedTouches.length;


        if(touches.length == 1) {
            if(holdActive)
                e.preventDefault();

            initTime = time;




            originPoint = {x: touches[0].pageX, y: touches[0].pageY};
        } else if(touches.length == 2 && !holdActive) {

            if(initTime + timeThreshold < time) {
                onHoldAndMoveStart(e);
                e.preventDefault();

                lastRelativePoint = relativePoint;

                if(touches.length > 1)
                    relativePoint = {x: touches[1].pageX, y: touches[1].pageY};
            }
        }


    });


    $(window).bind('touchmove', function (e) {

        var touches = e.originalEvent.touches;


        if(!!originPoint && holdActive) {
            e.preventDefault();

            var dx = originPoint.x - touches[0].pageX;
            var dy = originPoint.y - touches[0].pageY;

            window.scrollBy(dx, dy);
        }

        if(touches.length == 2 && holdActive) {
            e.preventDefault();




            lastRelativePoint = relativePoint;

            if(touches.length > 1)
                relativePoint = {x: touches[1].pageX, y: touches[1].pageY};

            /*if(calculateDistance(touches[0].pageX, touches[0].pageY, originPoint.x, originPoint.y) > 100) {
                onHoldAndMoveStop(e);
            }*/

            onHoldAndMoveMove(e);




        }


    });

    $(window).on('touchend', function (e) {

        var touches = e.originalEvent.touches;

        if(activeTouchCount > 0)
            activeTouchCount-= e.originalEvent.changedTouches.length;

        if(touches.length == 0 && holdActive) {
            onHoldAndMoveStop(e);
            lastRelativePoint = relativePoint;

            if(touches.length > 1)
                relativePoint = {x: touches[1].pageX, y: touches[1].pageY};
        }

    });


})(jQuery);