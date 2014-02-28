/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    27.02.14
 */
/*
 * jQuery Double Tap
 * Developer: Sergey Margaritov (sergey@margaritov.net)
 * Date: 22.10.2013
 * Based on jquery documentation http://learn.jquery.com/events/event-extensions/
 */

(function($){

    $.event.special.holdandmove = {
        bindType: 'touchstart',
        delegateType: 'touchstart',

        handle: function(event) {

            var handleObj   = event.handleObj,
                targetData  = $.data(event.target),
                now         = new Date().getTime(),
                delta       = targetData.lastTouch ? now - targetData.lastTouch : 0,
                lastTouchX  = targetData.lastTouchX || 999999,
                lastTouchY  = targetData.lastTouchY || 999999,
                deltaX      = Math.abs(lastTouchX - event.originalEvent.changedTouches[0].pageX),
                deltaY      = Math.abs(lastTouchY - event.originalEvent.changedTouches[0].pageY),

                delay       = delay == null ? 300 : delay;

            if (delta < delay && delta > 30 && deltaX * deltaX + deltaY * deltaY < 400) {
                targetData.lastTouch = null;
                event.type = handleObj.origType;
                ['clientX', 'clientY', 'pageX', 'pageY'].forEach(function(property) {
                    event[property] = event.originalEvent.changedTouches[0][property];
                })
                // let jQuery handle the triggering of "doubletap" event handlers
                handleObj.handler.apply(this, arguments);
            } else {
                targetData.lastTouch = now;
                targetData.lastTouchX = event.originalEvent.changedTouches[0].pageX;
                targetData.lastTouchY = event.originalEvent.changedTouches[0].pageY;
            }
        }
    };

})(jQuery);