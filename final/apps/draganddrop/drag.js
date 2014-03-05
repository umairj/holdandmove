(function($){
	
	var print = function(message) {
		$('#print-div').append(message + ' -- ');
	}
	
	var $document = $(document);
	
	var dragTarget = null,
		dragOffset = null;
		
	$document.on( 'onIdle', function() {
		dragTarget = null;
		dragOffset = null;
	});
	
	$document.on( 'onFirstTouchOnly', function() {
		dragTarget = null;
		dragOffset = null;
	});
	
	$document.on( 'onDrag', function(event) {
		
		try {
			
			var touchCoordinates = Matrix.screenToWorld(event.customData.activeTouch.pageX, event.customData.activeTouch.pageY);
			
			var activeTouch = event.customData.activeTouch;
			var $target = $(activeTouch.target);
			var targetTagName = $target.prop('tagName');
			
			// $target.position();
			//$target.css( { top: activeTouch.pageY - originalTargetPosition.y, left: activeTouch.pageX - originalTargetPosition.x, position:'absolute'} );


	//		
	
		var moveX;
		var moveY;
		if( targetTagName == "IMG") {
			if(!dragTarget){
				dragTarget = event.customData.activeTouch.target;
				dragOffset = {
					x: touchCoordinates.x - dragTarget.offsetLeft,
					y: touchCoordinates.y - dragTarget.offsetTop
				}
			} else {
				if( touchCoordinates.x - dragOffset.x + $(dragTarget).width() < $("body").width() ) {
					moveX = touchCoordinates.x - dragOffset.x;
					if(moveX < 0) {
						moveX = dragTarget.offsetX;
					}
				} else {
					moveX = dragTarget.offsetX;
				}
				if( touchCoordinates.y - dragOffset.y + $(dragTarget).height() < $("body").height() ) {
					moveY = touchCoordinates.y - dragOffset.y;
					if(moveY < 0) {
						moveY = dragTarget.offsetY;
					}
				} else {
					moveY = dragTarget.offsetY;
				}
				$(dragTarget).css({
					left: moveX,
					top: moveY,
					position: 'absolute'
				});
			}

			
				
			var originalTargetPosition = {
				x: activeTouch.target.offsetLeft,
				y: activeTouch.target.offsetTop
				
			};	
	//			var $targetClone = $target.clone();
	//			
	//			
	//			
	//			$(body).append( $targetClone );
		}
		}
		catch(error) {
			print(error);
		}
		
		
	} );
	
	
})(jQuery);