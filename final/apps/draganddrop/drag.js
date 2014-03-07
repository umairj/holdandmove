(function($){
	
	var DetectCollision = function( object, destination ) {
	
		var translation = Matrix.getTranslation();
		var scale = Matrix.getScale();
		
		
		
		if(object.offsetLeft + object.offsetWidth  *  + translation.x > window.innerWidth-38) {
			return true;
		}
			
	
		if( object.offsetLeft + object.offsetWidth  > destination.offsetLeft && 
			object.offsetTop  + object.offsetHeight > destination.offsetTop && 
			object.offsetTop  < destination.offsetTop + destination.offsetHeight ) {
			return true;
		}
		
	}
	
	var print = function(message) {
		$('#print-div').append(message + ' -- ');
	}

    var startElement = null;
    var startOffset = 0;
    var endElement = null;
    var endOffset = 0;

    function selectText(startElement, startOffset, endElement, endOffset) {
        var range = document.createRange();
        range.setStart(startElement, startOffset);
        range.setEnd(endElement, endOffset);

        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);

        highlight();
		
        window.getSelection().removeAllRanges();


    }

    function highlight () {
        document.designMode = "on";
        if (!document.execCommand("HiliteColor", false, 'blue')) {
            document.execCommand("BackColor", false, 'blue');
        }
        document.activeElement.blur();
        window.focus();

        document.designMode = "off";
    }
	
	var $document = $(document);
	
	var dragTarget = null,
		dragOffset = null,
		dragFinished = false;
		
	$document.on( 'onIdle', function() {

		try {

			if( !!dragTarget ) {
				dragTarget.parentNode.removeChild(dragTarget);
			}
			
			dragTarget = null;
			dragOffset = null;
			startElement = null;
			endElement = null;
		
		}
		catch(error) {
			print(error);
		}
		
	});
	
	$document.on( 'onFirstTouchOnly', function() {
		
		try {

			if(startElement && endElement) {
				print(startOffset);
				selectText(startElement, startOffset, endElement, endOffset);
			}


			if( !!dragTarget ) {
				dragTarget.parentNode.removeChild(dragTarget);
			}
		

			dragTarget = null;
			dragOffset = null;
			dragFinished = false;
			
			startElement = null;
			
			endElement = null;


		}
		catch(error) {
			print(error);
		}

	});
	
	$document.on( 'onDrag', function(event) {
		
		try {
			
			var touchCoordinates = Matrix.screenToWorld(event.customData.activeTouch.pageX, event.customData.activeTouch.pageY);
			
			var activeTouch = event.customData.activeTouch;
			var $target = $(activeTouch.target);
			var targetTagName = $target.prop('tagName');
			
			// $target.position();
			//$target.css( { top: activeTouch.pageY - originalTargetPosition.y, left: activeTouch.pageX - originalTargetPosition.x, position:'absolute'} );

            var caretRange = document.caretRangeFromPoint(activeTouch.pageX, activeTouch.pageY);

            if(!startElement) {
                if($(caretRange.startContainer.parentNode).css("background-color") != "rgb(0,0,255)") {
                    startElement = caretRange.startContainer;
                    startOffset = caretRange.startOffset;
                }
            } else {
                if($(caretRange.startContainer.parentNode) != "rgb(0,0,255)") {
                    endElement = caretRange.startContainer;
                    endOffset = caretRange.startOffset;
                }


            }


            
	//		
	
		var moveX;
		var moveY;
		if( targetTagName == "IMG" || $target.css("background-color") == "rgb(0,0,255)") {
			if(!dragTarget && !dragFinished){
				event.customData.activeTouch.target.style.position = 'absolute';
				dragTarget = event.customData.activeTouch.target.cloneNode();
				//dragTarget.style.position = 'absolute';
				dragTarget.className += 'moving-obj';
				//event.customData.activeTouch.target.parentNode.style.position = 'relative';
				//dragTarget.offsetX = 0;
				//dragTarget.offsetY = - event.customData.activeTouch.target.offsetY;
				event.customData.activeTouch.target.parentNode.appendChild(dragTarget);
				
				dragOffset = {
					x: touchCoordinates.x - dragTarget.offsetLeft,
					y: touchCoordinates.y - dragTarget.offsetTop
				}
			} else if( !!dragTarget ){
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
				
				var clipbaord = document.getElementById('clipboard');
				
				if( DetectCollision( dragTarget, clipbaord ) ) {
					var newTarget = dragTarget.cloneNode();
					newTarget.style.position = "static";
					var div = document.createElement('DIV');
					div.appendChild(newTarget);
					clipbaord.appendChild(div);
					$document.trigger('onFirstTouchOnly');
					dragFinished = true;
				}
				
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
	
	$document.on('onPan', function(event){
		var bar = document.getElementById('clipboard');
		var parent = $('#wrapper')[0];
		
		var position = {
			x: window.innerWidth - bar.offsetWidth -8,
			y: window.innerHeight * .3 - 8
		}
		//print(typeof window);
		
		var test = Matrix.resetElement(bar, parent, position);
	
	});
	
	$document.on('onIdle', function(event){
		var bar = document.getElementById('clipboard');
		var parent = $('#wrapper')[0];
		
		var position = {
			x: window.innerWidth - bar.offsetWidth -8,
			y: window.innerHeight * .3 - 8
		}
		//print(typeof window);
		
		var test = Matrix.resetElement(bar, parent, position);
	
	});
	
	

	$document.on('onDoTransformation', function(event){
		var bar = document.getElementById('clipboard');
		var parent = $('#wrapper')[0];
		
		var position = {
			x: window.innerWidth - bar.offsetWidth -8,
			y: window.innerHeight * .3 - 8
		}
		//print(typeof window);
		
		var test = Matrix.resetElement(bar, parent, position);
	
		
	});
		
	
	
})(jQuery);