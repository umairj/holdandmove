/**
 * @project holdnmove
 * @file
 * @author  Umair Jabbar
 * @date    01.03.14
 */



var Debug = function(message) {
    $('#debug').append( message + '<br/>' );
    //$('#debug').html(message);
};

(function ($){



    $(window).load(function() {
		// document ready
		//Debug('Start');
		
		var $document = $(document);
        
        /* Variables Needed */
		
		var thresholdTime = 200;	//200ms the time between two touches for HnM
        
        var states = {
            Idle              : 0,
			First_Touch_Only  : 1,
			Hold_And_Move     : 2,
			Transformation    : 3,
			Second_Touch_Only : 4
	    };
        
        var currentState;
        var lastNavigationTouchPosition;
        var lastActiveTouchPosition;
		var navigationTouch;
		var activeTouch;
		var firstTouchTime;
		
		
		/* Custom Events */
		
		var onIdle;
		var onFirstTouchOnly;
		var onHoldAndMove;
		var onTransformation;
		var onSecondTouchOnly;
		
		var onPan;
        var onDoTranformation;
		var onDrag;		// gets called up when the state is HoldAndMove and the otuch moves
		
		var Init = function(){
			currentState = states.Idle;
			navigationTouch = null;
			activeTouch = null;
			firstTouchTime = null;
			
			InitializeCustomEvents();
		};
        
		var InitializeCustomEvents = function(){
			onIdle = $.Event( 'onIdle' );
			onFirstTouchOnly = $.Event( 'onFirstTouchOnly' );
			onHoldAndMove = $.Event( 'onHoldAndMove' );
			onTransformation = $.Event( 'onTransformation' );
			onSecondTouchOnly = $.Event( 'onSecondTouchOnly' );
			
			onPan = $.Event( 'onPan' );
			onDoTranformation = $.Event( 'onDoTransformation' );
			onDrag = $.Event( 'onDrag' );
		};
		
		
        
        $document.on('touchstart', function(event){
            try{
			
			event.preventDefault();
            
			switch (currentState) {
				
				case states.Idle:
					onFirstTouchOnly.passedEvent = event;
                    firstTouchTime = event.originalEvent.timeStamp;
                    $document.trigger( onFirstTouchOnly );

					if( event.originalEvent.touches.length > 1 ) {
						onTransformation.passedEvent = event;
						$document.trigger( onTransformation );
					}
					break;
					
				case states.First_Touch_Only:
					////Debug("here - "+currentState);
					//if(firstTouchTime)
						////Debug(firstTouchTime);
					//else
						////Debug('problem');
					if( event.originalEvent.timeStamp - firstTouchTime >= thresholdTime ) {
						onHoldAndMove.passedEvent = event;
						$document.trigger( onHoldAndMove );
					} else {
						onTransformation.passedEvent = event;
						$document.trigger( onTransformation ); 
					}
					break;

                case states.Second_Touch_Only:
                    onHoldAndMove.passedEvent = event;
                    $document.trigger( onHoldAndMove );

					
				default :
					//Debug("Default case on touchstart - state is "+currentState);
				
				
			}
            } catch (error) {
                Debug('touchstart' + error.message);
            }
			
        });
		
		
		$document.on('touchend', function(event){

            try {
			event.preventDefault();
			
			switch (currentState) {
				case states.First_Touch_Only:
				case states.Second_Touch_Only:
					onIdle.passedEvent = event;
					$document.trigger( onIdle );
					break;
					
				case states.Hold_And_Move:
				case states.Transformation:
					if( event.originalEvent.changedTouches.length > 1 || event.originalEvent.touches.length == 0 ) {
						onIdle.passedEvent = event;
						$document.trigger( onIdle );
					} else {
						var changedTouch = event.originalEvent.changedTouches[0];
						if(!!changedTouch && !!navigationTouch && changedTouch.identifier == navigationTouch.identifier ) {
							//Debug('navigation touch released');
							onSecondTouchOnly.passedEvent = event;
							$document.trigger( onSecondTouchOnly );
						}
						else if(!!changedTouch && !!activeTouch && changedTouch.identifier == activeTouch.identifier ) {
							//Debug('activeTouch released');
							onFirstTouchOnly.passedEvent = event;
							$document.trigger( onFirstTouchOnly );
						}
                    }
					break;
				
				default:
					//Debug("Default case on touchend - state is "+currentState);
				
			}
            } catch (error) {
                Debug('touchend' + error.message);
            }
		});
		
		
		$document.on('touchmove', function(event){

            try {
			event.preventDefault();




            for(var i=0; i<event.originalEvent.touches.length; i++) {
                var touch = event.originalEvent.touches[i];

                if(!!activeTouch && touch.identifier == activeTouch.identifier) {


                    activeTouch = touch;


                }

                if(!!navigationTouch && touch.identifier === navigationTouch.identifier) {
                    //Debug(navigationTouch.identifier + ' ' + touch.identifier);
                    navigationTouch = touch;
                }

            }



			
			switch( currentState ) {


				
				case states.First_Touch_Only:
					onPan.passedEvent = event;
                    onPan.customData = {
                        navigationTouch: navigationTouch,
                        activeTouch: activeTouch,
                        lastNavigationTouchPosition: lastNavigationTouchPosition,
                        lastActiveTouchPosition: lastActiveTouchPosition
                    };

					$document.trigger( onPan );
					break;
					
				case states.Transformation:
					onDoTranformation.passedEvent = event;
                    onDoTranformation.customData = {
                        navigationTouch: navigationTouch,
                        activeTouch: activeTouch,
                        lastNavigationTouchPosition: lastNavigationTouchPosition,
                        lastActiveTouchPosition: lastActiveTouchPosition
                    };
					$document.trigger( onDoTranformation );
					break;
					
				case states.Hold_And_Move:
                    onPan.passedEvent = event;
                    onPan.customData = {
                        navigationTouch: navigationTouch,
                        activeTouch: activeTouch,
                        lastNavigationTouchPosition: lastNavigationTouchPosition,
                        lastActiveTouchPosition: lastActiveTouchPosition
                    };
                    $document.trigger( onPan );
				case states.Second_Touch_Only:	
					onDrag.passedEvent = event;
                    onDrag.customData = {
                        navigationTouch: navigationTouch,
                        activeTouch: activeTouch,
                        lastNavigationTouchPosition: lastNavigationTouchPosition,
                        lastActiveTouchPosition: lastActiveTouchPosition
                    };
					$document.trigger( onDrag );
					break;
					
				default:
					//Debug("Default case on touchmove - state is "+currentState);
				
			}

            if(!!navigationTouch)
                lastNavigationTouchPosition = {x: navigationTouch.pageX, y: navigationTouch.pageY};
            if(!!activeTouch)
                lastActiveTouchPosition = {x: activeTouch.pageX, y: activeTouch.pageY};

            } catch (error) {
                Debug('touchmove' + error.message);
            }
		});
		
	
		$document.on('onIdle',function(event){
			//Debug(event.type);
			
			firstTouchTime = null;
			navigationTouch = null;
			activeTouch = null;
			currentState = states.Idle;
			
		});
		
		$document.on('onFirstTouchOnly',function(event){
			//Debug(event.type);
			

            try {
			navigationTouch = event.passedEvent.originalEvent.touches[0];

            lastNavigationTouchPosition = {x: navigationTouch.pageX, y: navigationTouch.pageY};
			activeTouch = null;
			currentState = states.First_Touch_Only;
            } catch (error) {
                Debug('onFirstTouchOnly' + error.message);
            }
			
		});
		
		$document.on('onHoldAndMove',function(event){
			//Debug(event.type + ' length = ' + event.passedEvent.originalEvent.touches.length);
		
			if( currentState === states.First_Touch_Only ) {
				activeTouch = event.passedEvent.originalEvent.changedTouches[0];
                lastActiveTouchPosition = {x: activeTouch.pageX, y: activeTouch.pageY};
			} else if( currentState === states.Second_Touch_Only ) {
				navigationTouch = event.passedEvent.originalEvent.changedTouches[0];
                lastNavigationTouchPosition = {x: navigationTouch.pageX, y: navigationTouch.pageY};
			}
			currentState = states.Hold_And_Move;
		});
		
		$document.on('onTransformation',function(event){
			//Debug(event.type + ' length = ' + event.passedEvent.originalEvent.touches.length);
            try{


            if(event.passedEvent.originalEvent.changedTouches.length > 1) {

                navigationTouch = event.passedEvent.originalEvent.changedTouches[0];
                activeTouch = event.passedEvent.originalEvent.changedTouches[1];
                lastNavigationTouchPosition = {x: navigationTouch.pageX, y: navigationTouch.pageY};
                lastActiveTouchPosition = {x: activeTouch.pageX, y: activeTouch.pageY};
            } else {
                if( currentState === states.First_Touch_Only ) {



                    /*navigationTouch = event.passedEvent.originalEvent.changedTouches[0];
                    lastNavigationTouchPosition = {x: navigationTouch.pageX, y: navigationTouch.pageY};*/

                    activeTouch = event.passedEvent.originalEvent.changedTouches[0];
                    lastActiveTouchPosition = {x: activeTouch.pageX, y: activeTouch.pageY};

                } else if( currentState === states.Second_Touch_Only ) {
                    navigationTouch = event.passedEvent.originalEvent.changedTouches[0];
                    lastNavigationTouchPosition = {x: navigationTouch.pageX, y: navigationTouch.pageY};

                    /*activeTouch = event.passedEvent.originalEvent.changedTouches[1];
                    lastActiveTouchPosition = {x: activeTouch.pageX, y: activeTouch.pageY};*/
                }
            }
            } catch (error) {
                Debug(error.message);
            }

			currentState = states.Transformation;
		});
		
		$document.on('onSecondTouchOnly',function(event){
			//Debug(event.type);
		
			//firstTouchTime = event.passedEvent.originalEvent.timeStamp;

            try{
			navigationTouch = null;
			activeTouch = event.passedEvent.originalEvent.touches[0];
            if(!!activeTouch)
                lastActiveTouchPosition = {x: activeTouch.pageX, y: activeTouch.pageY};
			currentState = states.Second_Touch_Only;
            } catch (error) {
                Debug('onSecondTouchOnly' + error.message);
            }
		});
		
		$document.on( 'onPan', function(event) {
			//Debug(event.type);
		} );
		
		$document.on( 'onDoTransformation', function(event) {
			//Debug(event.type);
		} );
		
		$document.on( 'onDrag', function(event) {
			//Debug(event.type);
		} );
		
		
		// Initialization
		Init();
        

    });


    
    
    
    

})(jQuery);