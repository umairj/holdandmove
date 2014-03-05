(function($){

    var THRESHOLD = 200;

    var States = {
        ERROR: -1,
        NO_TOUCH: 0,
        FIRST_TOUCH_ONLY: 1,
        HOLD_AND_MOVE: 2,
        PAN_AND_ZOOM: 3,
        SECOND_TOUCH_ONLY: 4
    };

    var Event = {
        ERROR: -1,
        NOTHING: 0,

        TOUCH_START_0: 1,


        TOUCH_START_1: 2,
        TOUCH_START_1_AND_DELAY: 3,

        TOUCH_MOVE_0: 4,
        TOUCH_MOVE_1: 5,

        TOUCH_END_0: 6,
        TOUCH_END_1: 7
    };



    function calculateStep (type, event) {
        if (currentState == States.NO_TOUCH) {
            if (type == Event.TOUCH_START_0) {
                saveTouchTime();
                currentState = States.FIRST_TOUCH_ONLY;
            }
        } else if (currentState == States.FIRST_TOUCH_ONLY) {
            if (type == Event.TOUCH_END_0) {
                currentState = States.NO_TOUCH;
            } else if (type == Event.TOUCH_START_1) {
                currentState = States.PAN_AND_ZOOM;
            } else if (type == Event.TOUCH_START_1_AND_DELAY) {
                currentState = Event.HOLD_AND_MOVE;
            } else if(type == Event.TOUCH_MOVE_0) {
                translate(event);
            }
        } else if (currentState == States.PAN_AND_ZOOM) {
            if (type == Event.TOUCH_END_0 || type == Event.TOUCH_END_1) {
                currentState = States.FIRST_TOUCH_ONLY;
            }
            if (type == Event.TOUCH_MOVE_0 || type == Event.TOUCH_MOVE_1) {
                transform(event);
            }
        } else if (currentState == States.HOLD_AND_MOVE) {
            if (type == Event.TOUCH_END_1) {
                currentState = States.FIRST_TOUCH_ONLY;
            } else if (type == Event.TOUCH_END_1) {
                switchTouches();
                currentState = States.SECOND_TOUCH_ONLY;
            } else if (type == Event.TOUCH_MOVE_0) {
                translate(event);
            } else if (type == Event.TOUCH_MOVE_1) {
                freeAction(event);
            }
        } else if (currentState == States.SECOND_TOUCH_ONLY) {
            if (type == Event.TOUCH_MOVE_0) {
                freeAction(event);
            } else if (type == Event.TOUCH_START_0) {
                switchTouches();
                currentState = States.HOLD_AND_MOVE;
            } else if (type == Event.TOUCH_END_1) {
                currentState = States.NO_TOUCH;
            }
        }
    }

    // combination of translation and scaling
    function transform(event) {

    }

    // translation
    function translate(event) {

    }

    // free movement
    function freeAction() {

    }

    var touchTime = 0;

    function saveTouchTime() {
        touchTime = event.timeStamp;
    }

    // switch the touches
    function switchTouches () {
        navigationTouchPointer = 1 - navigationTouchPointer;
    }


    var elem = document;
    var currentState = States.NO_TOUCH;

    var touchPointer = 0;



    var activeTouch = null;
    var navigationTouch = null;





    $(elem).bind(' ', function (event) {
        event.preventDefault();

        var touches = event.touches;

        navigationTouch = touches[touchPointer];
        activeTouch = touches[1-touchPointer];

        if(touches.length == 0) {
            calculateStep(Event.TOUCH_START_0);
        } else if (touches.length == 1) {
            if(event.timeStamp - touchTime > THRESHOLD)
                calculateStep(Event.TOUCH_START_1_AND_DELAY);
            else
                calculateStep(Event.TOUCH_START_1)
        }
    });

    $(elem).bind('touchmove', function (event) {
        event.preventDefault();
    });

    $(document).bind('touchend', function (event) {
        elem.preventDefault();
    });





})(jQuery);