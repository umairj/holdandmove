/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    05.03.14
 */
(function($) {


    var $wrapper;

    $(document).ready(function () {
        $wrapper = $('#wrapper');
    });

    $(document).on( 'onPan', function(event) {
        var translation = {x: 0, y:0};
        translation.x = event.customData.navigationTouch.pageX - event.customData.lastNavigationTouchPosition.x;
        translation.y = event.customData.navigationTouch.pageY - event.customData.lastNavigationTouchPosition.y;
        if(!isNaN(translation.x) && !isNaN(translation.y)){
            Matrix.translate(translation.x, translation.y);
            Matrix.applyToElement($wrapper[0], true);
        }
    } );

    function distance(x1, y1, x2, y2) {
        return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
    }

    $(document).on( 'onDoTransformation', function(event) {
        try {
            var oldTouches = [event.customData.lastNavigationTouchPosition, event.customData.lastActiveTouchPosition];
            var newTouches = [event.customData.navigationTouch, event.customData.activeTouch];

            var oldDistance = distance(oldTouches[0].x, oldTouches[0].y, oldTouches[1].x, oldTouches[1].y);
            var newDistance = distance(newTouches[0].pageX, newTouches[0].pageY, newTouches[1].pageX, newTouches[1].pageY);

            var origin = {
                x: (newTouches[0].pageX + newTouches[1].pageX) / 2,
                y: (newTouches[0].pageY + newTouches[1].pageY) / 2
            };
            var translation = {
                x: (newTouches[0].pageX + newTouches[1].pageX) / 2 - (oldTouches[0].x + oldTouches[1].x) / 2,
                y: (newTouches[0].pageY + newTouches[1].pageY) / 2 - (oldTouches[0].y + oldTouches[1].y) / 2
            };

            if(!isNaN(translation.x) && !isNaN(translation.y)){
                Matrix.translate(translation.x, translation.y);
            }
            if(!isNaN(origin.x) && !isNaN(origin.y) && !isNaN(newDistance) && !isNaN(oldDistance) && oldDistance > 0) {
                Matrix.translate(-origin.x, -origin.y);
                Matrix.scale(Math.sqrt(newDistance / oldDistance));
                Matrix.translate(origin.x, origin.y);
            }
            Matrix.applyToElement($wrapper[0], true);
        } catch (error) {
            Debug(error);
        }
    } );

    $(document).on( 'onDrag', function(event) {

    } );

    $(document).on('onIdle', function () {

        var $wrapper = $('#wrapper');

        if($wrapper.hasClass('snap')) {
            var matrixTranslation = Matrix.getTranslation();
            var matrixScale = Matrix.getScale();
            var translation = {x: 0, y: 0};
            var scale = 1;

            if(window.innerWidth < window.innerHeight) {
                if($wrapper[0].offsetWidth * matrixScale < window.innerWidth) {
                    scale =    $wrapper[0].offsetWidth / matrixScale;
                }
            } else {
                if($wrapper[0].offsetHeight * matrixScale < window.innerHeight)
                    scale = window.innerHeight / $wrapper[0].offsetHeight /  matrixScale;
            }

            if(matrixTranslation.x < window.innerWidth - $wrapper[0].offsetWidth * matrixScale) {
                if($wrapper[0].offsetWidth * matrixScale > window.innerWidth) {
                    translation.x = window.innerWidth-$wrapper[0].offsetWidth * matrixScale - matrixTranslation.x - 2 * parseInt($wrapper.css('marginRight').replace('px',''));
                } else {
                    translation.x = -matrixTranslation.x ;
                }
            }
            if(matrixTranslation.y < window.innerHeight-$wrapper[0].offsetHeight * matrixScale) {
                if($wrapper[0].offsetHeight * matrixScale > window.innerHeight) {
                    translation.y = window.innerHeight-$wrapper[0].offsetHeight * matrixScale- matrixTranslation.y - 2 * parseInt($wrapper.css('marginBottom').replace('px',''));
                } else {
                    translation.y = -matrixTranslation.y;
                }
            }
            if(matrixTranslation.x > 0) {
                translation.x = -matrixTranslation.x;
            }
            if(matrixTranslation.y > 0) {
                translation.y = -matrixTranslation.y;
            }
            if(!isNaN(translation.x) && !isNaN(translation.y))
                Matrix.translate(translation.x, translation.y);

            if(!isNaN(scale))
                Matrix.scale(scale);
            Matrix.applyToElement($wrapper[0], false);
        }


    })

})(jQuery);