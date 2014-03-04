(function () {


    var State = {
        Idle : 0,
        FirstTouchOnly : 1,
        SecondTouchOnly: 2,
        HoldAndMove : 3,
        Transform: 4
    };

    var numberOfTouches = 0;

    var activeTouch = null;
    var navigationTouch = null;

    var touchStartTime = 0;

    var timeThreshold = 200; // ms

    var currentState = State.Idle;

    function ChangeStateTo(stateName) {
        currentState = State[stateName];
        Debug(stateName);
    }

    function Debug(str) {
        document.getElementById('debug').innerText = str;
    }

    window.addEventListener('touchstart', function (event) {

        switch(currentState) {
            case State.Idle:
                touchStartTime = event.timeStamp;
                numberOfTouches = 1;

                if(event.touches.length == 1) {
                    ChangeStateTo('FirstTouchOnly');
                    navigationTouch = event.touches[0];
                } else if (event.touches.length == 2){
                    ChangeStateTo('Transform');
                    navigationTouch = event.touches[0];
                    activeTouch = event.touches[1];
                }


                break;

            case State.SecondTouchOnly:
                navigationTouch = event.touches[1];
                numberOfTouches = 2;
                ChangeStateTo('HoldAndMove');
                break;

            case State.FirstTouchOnly:

                activeTouch = event.touches[1];

                numberOfTouches = 2;
                if(event.timeStamp - touchStartTime > timeThreshold)
                    ChangeStateTo('HoldAndMove');
                else
                    ChangeStateTo('Transform');
                break;

        }

    });

    window.addEventListener('touchmove', function (event) {
        event.preventDefault();
        switch(currentState) {
            case State.FirstTouchOnly:
                Debug('- Pan');
                break;
            case State.SecondTouchOnly:
                Debug('- Move');
                break;
            case State.HoldAndMove:
                var str = '';
                for(var i=0; i<event.changedTouches.length; i++) {
                    if(event.changedTouches[i].identifier == activeTouch.identifier)
                        str += '- Move';
                    else if(event.changedTouches[i].identifier == navigationTouch.identifier)
                        str += '- Pan';
                }
                Debug(str);
                break;
            case State.Transform:
                Debug('Transform');
                break;
        }
    });

    window.addEventListener('touchend', function (event) {
        switch(currentState) {
            case State.SecondTouchOnly:
            case State.FirstTouchOnly:
                numberOfTouches = 0;
                ChangeStateTo('Idle');

                break;

            case State.HoldAndMove:
            case State.Transform:
                numberOfTouches = 1;

                if(event.touches[0].identifier == activeTouch.identifier) {

                    activeTouch = event.touches[0];
                    ChangeStateTo('SecondTouchOnly');
                }

                else {
                    ChangeStateTo('FirstTouchOnly');
                    navigationTouch = event.touches[0];
                }


                break;
        }
    });





})();