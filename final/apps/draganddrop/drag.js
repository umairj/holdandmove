(function($){
	
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
		dragOffset = null;
		
	$document.on( 'onIdle', function() {



		dragTarget = null;
		dragOffset = null;
        startElement = null;
        endElement = null;
	});
	
	$document.on( 'onFirstTouchOnly', function() {

        if(startElement && endElement) {
            selectText(startElement, startOffset, endElement, endOffset);
        }

		dragTarget = null;
		dragOffset = null;
        startElement = null;
        endElement = null;

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

        //print($target.css('background-color'));

	//		
	
		var moveX;
		var moveY;
		if( targetTagName == "IMG" || targetTagName == "SPAN") {
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