(function($){
	
	var imageUrls = [];
	
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
	
	var GetImage = function(  ) {
		
		var imgUrl ='http://i.imgur.com/'+Math.random().toString(36).substr(2,6)+'.png';
		
		var img = new Image();
		img.onload = function(){
			imageUrls.push(this.src);
		};
		img.onerror = function(){
			GetImage();
		};
		img.src = imgUrl;
		
	}
	
	var Init = function(){
		for( var i = 0; i < 10; i++ ) {
			GetImage();
		}
	}
	
	var print = function(message) {
		$('#print-div').append(message + ' -- ');
	}
	
	
	Init();
	console.log('imageUrls');
	console.log(imageUrls);

    var startElement = null;
    var startOffset = 0;
    var endElement = null;
    var endOffset = 0;

	
	var $document = $(document);
	
	var dragTarget = null,
		dragOffset = null,
		dragFinished = false;
		
	$document.on( 'onIdle', function() {

		try {

			//if( !!dragTarget ) {
				//dragTarget.parentNode.removeChild(dragTarget);
			//}
			
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


			/*if( !!dragTarget ) {
				dragTarget.parentNode.removeChild(dragTarget);
			}*/
		

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

            

            
	//		
	
		var moveX;
		var moveY;
		if( targetTagName == "IMG" ) {
			if(!dragTarget && !dragFinished){
				
				dragTarget = event.customData.activeTouch.target;
				
				event.customData.activeTouch.target.style.position = 'absolute';
				//dragTarget = event.customData.activeTouch.target.cloneNode();
				//dragTarget.style.position = 'absolute';
				dragTarget.className += 'moving-obj';
				//event.customData.activeTouch.target.parentNode.style.position = 'relative';
				//dragTarget.offsetX = 0;
				//dragTarget.offsetY = - event.customData.activeTouch.target.offsetY;
				//event.customData.activeTouch.target.parentNode.appendChild(dragTarget);
				
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