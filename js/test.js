/**
 * @project holdnmove
 * @file
 * @author  Umair Jabbar
 * @date    01.03.14
 */


(function ($){

    var Debug = function(message) {
        $('#debug').append( message + '<br/>' );
    }

    $(function() {
		// document ready
		Debug('Start');
		
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
			
			event.preventDefault();
            
			switch (currentState) {
				
				case states.Idle:
					onFirstTouchOnly.passedEvent = event;
					$document.trigger( onFirstTouchOnly );
					if( event.originalEvent.touches.length > 1 ) {
						onTransformation.passedEvent = event;
						$document.trigger( onTransformation );
					}
					break;
					
				case states.First_Touch_Only:
				case states.Second_Touch_Only:
					//Debug("here - "+currentState);
					//if(firstTouchTime)
						//Debug(firstTouchTime);
					//else
						//Debug('problem');
					if( event.originalEvent.timeStamp - firstTouchTime >= thresholdTime ) {
						onHoldAndMove.passedEvent = event;
						$document.trigger( onHoldAndMove );
					} else {
						onTransformation.passedEvent = event;
						$document.trigger( onTransformation ); 
					}
					break;
					
				default :
					Debug("Default case on touchstart - state is "+currentState);
				
				
			}
			
			
        });
		
		
		$document.on('touchend', function(event){
            
			event.preventDefault();
			
			switch (currentState) {
				case states.First_Touch_Only:
				case states.Second_Touch_Only:
					onIdle.passedEvent = event;
					$document.trigger( onIdle );
					break;
					
				case states.Hold_And_Move:
				case states.Transformation:
					try {
						if( event.originalEvent.changedTouches.length > 1 ) {
							onIdle.passedEvent = event;
							$document.trigger( onIdle );
						} else {
							var changedTouch = event.originalEvent.changedTouches[0];
							if( changedTouch.identifier == navigationTouch.identifier ) {
								Debug('navigation touch released');
								onSecondTouchOnly.passedEvent = event;
								$document.trigger( onSecondTouchOnly );
							}
							else if( changedTouch.identifier == activeTouch.identifier ) {
								Debug('activeTouch released');
								onFirstTouchOnly.passedEvent = event;
								$document.trigger( onFirstTouchOnly );
							}
						
						}
					} catch(e) {
						Debug('<b> error : ' + e.message + '</b>');
					}
					//onFirstTouchOnly.passedEvent = event;
					//$document.trigger( onFirstTouchOnly );
					break;
				
				default:
					Debug("Default case on touchend - state is "+currentState);
				
			}
		});
		
		
		$document.on('touchmove', function(event){
			
			event.preventDefault();
			
			switch( currentState ) {
				
				case states.First_Touch_Only:
					onPan.passedEvent = event;
					$document.trigger( onPan );
					break;
					
				case states.Transformation:
					onDoTranformation.passedEvent = event;
					$document.trigger( onDoTranformation );
					break;
					
				case states.Hold_And_Move:
				case states.Second_Touch_Only:	
					onDrag.passedEvent = event;
					$document.trigger( onDrag );
					break;
					
				default:
					Debug("Default case on touchmove - state is "+currentState);
				
			}
			
			
		});
		
	
		$document.on('onIdle',function(event){
			Debug(event.type);
			
			firstTouchTime = null;
			navigationTouch = null;
			activeTouch = null;
			currentState = states.Idle;
			
		});
		
		$document.on('onFirstTouchOnly',function(event){
			Debug(event.type);
			
			firstTouchTime = event.passedEvent.originalEvent.timeStamp;
			navigationTouch = event.passedEvent.originalEvent.touches[0];
			activeTouch = null;
			currentState = states.First_Touch_Only;
			
		});
		
		$document.on('onHoldAndMove',function(event){
			Debug(event.type + ' length = ' + event.passedEvent.originalEvent.touches.length);
		
			if( currentState === states.First_Touch_Only ) {
				activeTouch = event.passedEvent.originalEvent.changedTouches[0];
			} else if( currentState === states.Second_Touch_Only ) {
				navigationTouch = event.passedEvent.originalEvent.changedTouches[0];
			}
			
			currentState = states.Hold_And_Move;
		});
		
		$document.on('onTransformation',function(event){
			Debug(event.type + ' length = ' + event.passedEvent.originalEvent.touches.length);
		
			if( currentState === states.First_Touch_Only ) {
				activeTouch = event.passedEvent.originalEvent.changedTouches[0];
			} else if( currentState === states.Second_Touch_Only ) {
				navigationTouch = event.passedEvent.originalEvent.changedTouches[0];
			}
			
			currentState = states.Transformation;
		});
		
		$document.on('onSecondTouchOnly',function(event){
			Debug(event.type);
		
			firstTouchTime = event.passedEvent.originalEvent.timeStamp;
			navigationTouch = null;
			activeTouch = event.passedEvent.originalEvent.touches[0];
			currentState = states.Second_Touch_Only;
		});
		
		$document.on( 'onPan', function(event) {
			Debug(event.type);
		} );
		
		$document.on( 'onDoTransformation', function(event) {
			Debug(event.type);
		} );
		
		$document.on( 'onDrag', function(event) {
			Debug(event.type);
		} );
		
		
		// Initialization
		Init();
        

    });


    
    
    
    

})(jQuery);