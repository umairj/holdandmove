(function(){

    var canvas,
        context;

    var touches = [],
        changedTouches = [],

        startTouches = [],
        moveTouches = [],
        endTouches = [];

    var debugElementStart,
        debugElementMove,
        debugElementEnd;

    function init () {
        canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        context = canvas.getContext("2d");

        document.getElementsByTagName('body')[0].appendChild(canvas);

        with(canvas.style) {
            position = 'absolute';
            left = 0;
            top = 0;
            zIndex = -1;
        }



        debugElementStart = document.getElementById('debug-start');
        debugElementMove = document.getElementById('debug-move');
        debugElementEnd = document.getElementById('debug-end');



    }

    function copyTouches(touchList, targetList) {
        targetList.length = 0;
        for(var i=0; i<touchList.length; i++) {
            touch = touchList[i];
            targetList.push({
                x: touch.pageX,
                y: touch.pageY,
                id: touch.identifier
            })
        };
    }

    function printTouchLists (lists, elem) {
        var str = '';

        lists.forEach(function (list) {
            str += '<p>';
            var index = 0;
            list.forEach(function(item) {
                str += 'touch ' + (index++) + ':';
                str += 'x : ' + item.x;
                str += 'y : ' + item.y;
                str += 'id : ' + item.id;
                        str += ' | ';
            });
            str += '</p>';
        });

        elem.innerHTML = str;
    }

    function showTouches () {
        printTouchLists([startTouches, touches, changedTouches], debugElementStart);
        printTouchLists([moveTouches, touches, changedTouches], debugElementMove);
        printTouchLists([endTouches, touches, changedTouches], debugElementEnd);
    }

    window.addEventListener('load', function() {
        init();
    });

    window.addEventListener('touchstart', function (event) {
        event.preventDefault();
        copyTouches(event.touches, startTouches);
        copyTouches(event.touches, touches);
        copyTouches(event.changedTouches, changedTouches);
        showTouches();
    });

    window.addEventListener('touchmove', function (event) {
        event.preventDefault();
        copyTouches(event.touches, moveTouches);
        copyTouches(event.touches, touches);
        copyTouches(event.changedTouches, changedTouches);
        showTouches();
    });

    window.addEventListener('touchend', function (event) {
        event.preventDefault();
        copyTouches(event.touches, endTouches);
        copyTouches(event.touches, touches);
        copyTouches(event.changedTouches, changedTouches);
        showTouches();
    });

})();