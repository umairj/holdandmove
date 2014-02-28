/* Hold and Move Framework updated: 2013-01-14
* requires the following libs:
*   -jquery-1.9.1.js
*   -jquery-ui.js
*   -rangy-core.js
*   -rangy-cssclassapplier.js
*   -rangy-textrange.js
* Build 304 of rangy was used. Later version of these libraries might work.
* All other requirements are noted in the hnmtest.html or partially at the 
* corresponding sections and functions in this file
*/

//Settings
var WrapperName = 'wrapper';
var EnableTextSelection = true; //performance intensive
var SelectionClass = "Selection";
var TextID = "text"; //node that contains selectable text 
var MoveUpdateInterval = 30; //60fps ~= 16, 30fps ~=33
var MoveOnRealTarget = false;
var Continous_Selection = false; //if disabled one has to deselect first before being able to select again
var MaxScale = 3.0;
var MinScale = 0.5;

//Fixes
if(!window.console){ window.console = {log: function(){} }; } //fix for forgotten debug outputs

//States
//These could be converted to Events
var dragging = false; //basically a global copy of touch handled
var zooming = false;
var selecting = false;

/*  Init panning and zooming
* apply -webkit-transform:translate3d(0,0,0) to all images for hardware accerleration
* scrolling requires the scrollable part to be in 2 divs: wrapper and scroll-content
* wrapper name can be changed above
* both need the same z-index and position:absolute
*/

function InitPanZoom() {
  Wrap = document.getElementById(WrapperName);
  Scroll = Wrap.children[0];
  jqScroll = $('#'+ WrapperName).children().first(); //Scroller as JQuery Obj
  //set styles required for transform
  Scroll.style["webkitTransitionProperty"] = 'webkittransform';
  Scroll.style["webkitTransitionDuration"] = '0';
  Scroll.style["webkitTransformOrigin"] = '0 0';
}
document.addEventListener('DOMContentLoaded', InitPanZoom, false);

/*
*first proxy layer
*enables move to be called on actual target(optional)
*improves move performance (updaterate xxhz)
*outputs finger- events
*/
var touches = {};
var allTouches = [];
var n = 0;

var highestId=1;
$(document).bind("touchstart",function(e){
  e.preventDefault();
  var startTouches = e.originalEvent.changedTouches;
  allTouches = e.originalEvent.touches;
  for( var i=0; i<startTouches.length; i++ ) {
    var t = startTouches[i];
    var touch = {
      pageX:t.pageX,
      pageY:t.pageY,
      screenX:t.screenX, //added for click simulation
      screenY:t.screenY,
      clientX:t.clientX,
      clientY:t.clientY,
      target:e.target,
      timestamp:e.timeStamp,
      id:highestId++
    };
    touches[t.identifier] = touch;
    $(e.target).trigger("fingerdown",touch);
  }
  return false;
});


$(document).bind("touchmove",function(e){
  e.preventDefault();
  var changedTouches = e.originalEvent.changedTouches;
  for( var i=0; i<changedTouches.length; i++ ) {
    var t = changedTouches[i];
    if( touches[t.identifier] ) {
      touches[t.identifier].pageX = t.pageX;
      touches[t.identifier].pageY = t.pageY;
      touches[t.identifier].screenX = t.screenX; //added for click simulation
      touches[t.identifier].screenY = t.screenY;
      touches[t.identifier].clientX = t.clientX;
      touches[t.identifier].clientY = t.clientY;
      //the following code gets the target that currently lies under the touch
      //normally touchmove is triggered on the same element as touchstart
      // var elem = document.elementFromPoint(t.screenX, t.screenY);
      // touch.target = elem;
      // $(elem).trigger("fingermove",touch);
      //uncomment to trigger in the system-specified speed instead of MoveUpdateInterval 
      // $(touches[t.identifier].target).trigger("fingermove",touches[t.identifier]);
    }
  }
  return false;
});

// Setup a xxfps timer
timer = setInterval(function() {
  for( var i=0; i<allTouches.length; i++ ) {
    var t = allTouches[i];
    var touch = touches[t.identifier];
    if(touch)
    {
      if(MoveOnRealTarget)
      {
        var elem = document.elementFromPoint(touch.screenX, touch.screenY);
        touch.target = elem;
        $(elem).trigger("fingermove",touch);
      }
      else{
       $(touch.target).trigger("fingermove",touch);
     }
    }
    
  }
}, MoveUpdateInterval);

$(document).bind("touchend", function(e){
  e.preventDefault();
  var changedTouches = e.originalEvent.changedTouches;
  for( var i=0; i<changedTouches.length; i++ ) {
    var t = changedTouches[i];
    var touch = touches[t.identifier];
    if( touch ) {
      touch.pageX = t.pageX;
      touch.pageY = t.pageY;
      touch.screenX = t.screenX; //added for click simulation
      touch.screenY = t.screenY;
      touch.clientX = t.clientX;
      touch.clientY = t.clientY;
      touch.target = e.target;
      $(e.target).trigger("fingerup",touch); //needs to be called on a target
      delete touches[t.identifier];
    }
  }
  return false;
});


// $(document).bind("touchcancel touchleave",function(e){
//   //this shouldn't happen at all
//   e.preventDefault();
//   console.log("touchcancel triggered");
//   return false;
// });


/*
*second proxy layer catches finger- events
*distinguishes between hold and move
*emits movefinger- events 
*/

var panFinger;
var dragFinger;
var panStartTime=0;
var zoomThreshold = 200;
var zoomFactor = 1.0;
var oldX,oldY;
var oldDistance;
var oldCenter;
var p;

//Helper functions
function distance( a,b ) {
  var d = {x:a.pageX-b.pageX,y:a.pageY-b.pageY};
  return Math.sqrt( (d.x*d.x)+(d.y*d.y) );
}
function center( a,b ) {
  return( { x:(a.pageX+b.pageX)/2,y:(a.pageY+b.pageY)/2 });
}

function initPan(finger){
    panFinger = finger;
    panStartTime =finger.timestamp;
    oldX = finger.clientX;
    oldY = finger.clientY;
}

var totalX=0, totalY=0;
function LimitPan()
{
  var wrapperWidth = Wrap.clientWidth || 1; //workaround inspired by iscroll
  var wrapperHeigth = Wrap.clientHeight || 1;
  var minX = 0;  var minY = 0; //for Readability
  var scrollerWidth = Math.round(Scroll.offsetWidth * zoomFactor);
  var scrollerHeigth = Math.round((Scroll.offsetHeight + minY) * zoomFactor);
  var maxX = wrapperWidth - scrollerWidth;
  var maxY = wrapperHeigth - scrollerHeigth + minY;
  //Note for maxX/Y: negative values mean that theres scrollable content

  if(totalX >= minX) //limit on the left
    totalX = minX;
  else if(maxX > 0) //don't scroll if there's not enough to scroll
    totalX = 0;
  //Note the implication: maxX is <= 0 in the following condition
  else if(totalX < maxX) //limit scroll to maxX
    totalX = maxX;

  if(totalY >= minY) //limit at the ceiling
    totalY = minY;
  else if(maxY > 0) //don't scroll if there's not enough to scroll
    totalY = 0;
  else if(totalY < maxY) //limit scroll to maxY
    totalY = maxY;
}

function doPan(finger){
  var newX = finger.clientX;
  var newY = finger.clientY;

  totalX += -(oldX-newX);
  totalY += -(oldY-newY);

  LimitPan();
  jqScroll.css({"webkitTransform": "translate(" +totalX+"px, "+totalY+"px) scale("+zoomFactor+") translateZ(0)"});

  oldX = newX;
  oldY = newY;
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    if (el != Wrap) {
      _x *= zoomFactor;
      _y *= zoomFactor;
    }
    return { top: _y, left: _x };
}

function doZoom(x, y, scale){
  if(scale >= MinScale && scale <= MaxScale)
  {
    var relScale = scale / zoomFactor;
    //get offset of the wrapper
    var wrapperOffsetLeft = getOffset( Wrap).left;
    var wrapperOffsetTop = getOffset( Wrap).top;
    //normalize according to previous transform
    x = x - wrapperOffsetLeft - totalX;
    y = y - wrapperOffsetTop - totalY;
    totalX = x - x * relScale + totalX;
    totalY = y - y * relScale + totalY;

    LimitPan();
    //TODO: Android may be incompatible with translateZ
    jqScroll.css({"webkitTransform": "translate(" +totalX+"px, "+totalY+"px) scale("+scale+") translateZ(0)"});

    zoomFactor = scale;
  }
}

$(document).bind("fingerdown",function(e,finger){
  if(!panFinger){
    initPan(finger);
    // console.log("new pan finger " + finger.id);
  }
  //Zooming criteria: 2 fingers in Threshold-time or zooming active
  else if((finger.timestamp - panStartTime) < zoomThreshold || zooming){
    zooming = true;
    dragFinger = finger; //second finger start the zooming
    oldDistance = distance(panFinger, dragFinger);
    oldCenter = center(panFinger, dragFinger);
    // console.log("Zoom");
  }
  else{
    dragFinger = finger;
    // console.log("new drag finger");
    $(finger.target).trigger("movefingerdown",finger);
  }
});

$(document).bind("fingermove",function(e,finger){
  if(zooming){
    //Zoom if both finger, Pan if only one
    if(panFinger && dragFinger){
      var newDistance = distance( panFinger, dragFinger );
      doZoom(oldCenter.x,oldCenter.y, zoomFactor * (newDistance/oldDistance));
      oldDistance=newDistance;
    }
    else
      doPan(finger);
  }
  else if(dragFinger && finger.id === dragFinger.id){
    $(finger.target).trigger("movefingermove",finger);
  }
  else if(panFinger && finger.id === panFinger.id){
    doPan(finger);
  }
});

//CTRL+F->Magic Workaround 131
function cleanup(){
  while($(".TO_BE_REMOVED").length > 0)
  {
    $(".TO_BE_REMOVED").each(function () {
        $(this).replaceWith($(this).html());
    });
  }
}


$(document).bind("fingerup",function(e,finger){
  //remove fingers if they are removed from the surface
  if(panFinger && finger.id === panFinger.id){
      panFinger = undefined;
      // console.log("pan finger up");
      //if we still have a finger after zooming use it for panning
      if(zooming && dragFinger){
        initPan(dragFinger);
        dragFinger = undefined;
      }
      else
        zooming = false; //zooming ends when no more fingers left on surface
  }
  else if(dragFinger && finger.id === dragFinger.id){
    dragFinger = undefined;
    $(finger.target).trigger("movefingerup",finger); //maybe fired during zooming
    // console.log("drag finger up");
  }
  //if both finger are up and there is no selection
  if(!dragFinger && !panFinger && rangy.getSelection().isCollapsed){
      cleanup();
      // console.log("Cleaning up");
    }
});


/*
* target layer Part1: Dragging
* -draggable or helper needs to be appended to a position:absolute element
* -draggable z-index must be higher or equal to droppable
* -mostly taken from:
*/
/*!
 * jQuery UI Touch Punch 0.2.2
 *
 * Copyright 2011, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */

(function ($) {

  // Detect touch support
  $.support.touch = 'ontouchend' in document;

  // Ignore browsers without touch support
  if (!$.support.touch) {
    return;
  }

  var mouseProto = $.ui.mouse.prototype,
      _mouseInit = mouseProto._mouseInit,
      touchHandled;


  /**
   * Simulate a mouse event based on a corresponding touch event
   * @param {Object} event A touch event
   * @param {String} simulatedType The corresponding mouse event
   */
  function simulateMouseEvent (event, touch,simulatedType) {

    var simulatedEvent = document.createEvent('MouseEvents');
    
    // Initialize the simulated mouse event using the touch event's coordinates
    simulatedEvent.initMouseEvent(
      simulatedType,    // type
      true,             // bubbles                    
      true,             // cancelable                 
      window,           // view                       
      1,                // detail                     
      touch.screenX,    // screenX                    
      touch.screenY,    // screenY                    
      touch.clientX,    // clientX                    
      touch.clientY,    // clientY                    
      false,            // ctrlKey                    
      false,            // altKey                     
      false,            // shiftKey                   
      false,            // metaKey                    
      0,                // button                     
      null              // relatedTarget              
    );

    // Dispatch the simulated event to the target element
    event.target.dispatchEvent(simulatedEvent);
  }

  /**
   * Handle the jQuery UI widget's touchstart events
   * @param {Object} event The widget element's touchstart event
   */
    mouseProto._moveFingerDown = function(event, touch){
    dragging = true;
    var self = this;

    // Ignore the event if another widget is already being handled
    if (touchHandled || !self._mouseCapture(touch)) {
      return;
    }

    // Set the flag to prevent other widgets from inheriting the touch event
    touchHandled = true;

    // Track movement to determine if interaction was a click
    self._touchMoved = false;

    // Simulate the mouseover event
    simulateMouseEvent(event, touch, 'mouseover');

    // Simulate the mousemove event
    simulateMouseEvent(event, touch, 'mousemove');

    // Simulate the mousedown event
    simulateMouseEvent(event, touch, 'mousedown');
  };

  /**
   * Handle the jQuery UI widget's touchmove events
   * @param {Object} event The document's touchmove event
   */
    mouseProto._moveFingerMove = function (event, touch) {

    // Ignore event if not handled
    if (!touchHandled) {
      return;
    }

    // Interaction was not a click
    this._touchMoved = true;

    // Simulate the mousemove event
    simulateMouseEvent(event, touch, 'mousemove');
  };

  /**
   * Handle the jQuery UI widget's touchend events
   * @param {Object} event The document's touchend event
   */
  mouseProto._moveFingerUp = function (event, touch) {
    // Ignore event if not handled
    if (!touchHandled) {
      return;
    }

    // Simulate the mouseup event
    simulateMouseEvent(event, touch, 'mouseup');

    // Simulate the mouseout event
    simulateMouseEvent(event, touch, 'mouseout');

    // If the touch interaction did not move, it should trigger a click
    if (!this._touchMoved) {

      // Simulate the click event
      simulateMouseEvent(event, touch, 'click');
    }

    // Unset the flag to allow other widgets to inherit the touch event
    touchHandled = false;
    dragging = false;
  };

  /**
   * A duck punch of the $.ui.mouse _mouseInit method to support touch events.
   * This method extends the widget with bound touch event handlers that
   * translate touch events to mouse events and pass them to the widget's
   * original mouse event handling methods.
   */
  mouseProto._mouseInit = function () {
    
    var self = this;

    // Delegate the touch handlers to the widget's element
    self.element
      .bind('movefingerdown', $.proxy(self, '_moveFingerDown'))
      .bind('movefingermove', $.proxy(self, '_moveFingerMove'))
      .bind('movefingerup', $.proxy(self, '_moveFingerUp'));

    // Call the original $.ui.mouse init method
    _mouseInit.call(self);
  };

})(jQuery);

/*
* target layer Part2: Text Selection
* Notes:  -creates standards Selections
*         -fires selection- events with the touch info
*         -only text in the Node TextID can be selected
*
* Problems: -line breaks can't be selected
*           -tested only in mobile Safari
*/

var startNode;
var startOffset;

function createSelectionFromPoints(endX, endY) {
    var doc = document;
    var end, range = null;


    var sel = rangy.getSelection();
    sel.removeAllRanges();
    sel.restoreCharacterRanges($(TextID)[0], startOffset);

    end = doc.caretRangeFromPoint(endX, endY);
    range = rangy.createRangyRange(doc);
    range.setStart(sel.anchorNode, sel.anchorOffset);
    range.setEnd(end.startContainer, end.startOffset);
    //if our range is empty try backwards
    if(range.collapsed){
        range = rangy.createRangyRange(doc);
        range.setStart(end.startContainer, end.startOffset);
        range.setEnd(sel.anchorNode, sel.anchorOffset);
    }


    //Only select text inside TextID
    var textrange = rangy.createRangyRange(doc);
    textrange.selectNodeContents(document.getElementById(TextID));
    range = range.intersection(textrange);

    //highlight the range
    cssApplier = rangy.createCssClassApplier(SelectionClass, {normalize: true});
    cssApplier.applyToRange(range);

    //create a selection
    var selection = rangy.getSelection();
    selection.setSingleRange(range);
}

/* Magic Workaround 131:
*if touchstart is triggered on a a highlighted area we can't simply remove 
*elements of said area as this would remove the original target. Thus all
*events(touchmove/touchend) of that finger would be lost. Therefore we only 
*remove the class and add a temporary class. The actual removal can only be done
*if both fingers are up and there is no selection.
*/

function unhighlight(){
  //unhighlight by removing the highlighting class
  $("." + SelectionClass).each(function () {
      $(this).removeClass(SelectionClass);
      $(this).addClass("TO_BE_REMOVED");
  });
}

/* For unknown reasons the action in movefingermove may not be executed
* without a simple command in the function. Console.log works if debugging is enabled
* Just incrementing a counter seems to work as well.
*/
var hack_smovecnt = 0; //Silly hack
var alreadyDeselected = true; //if our last action was Selection

if(EnableTextSelection){
  $(document).bind("movefingerdown",function(e, touch){
    if(!dragging){
      unhighlight();
      if(Continous_Selection || alreadyDeselected)
      {
        selecting = true;
        alreadyDeselected = false;
        var selectionstart = document.caretRangeFromPoint(touch.pageX, touch.pageY);
        var sel = rangy.getSelection();
        sel.setSingleRange(selectionstart);
        startNode = sel.anchorNode;
        startOffset = rangy.getSelection().saveCharacterRanges($(TextID)[0]);
        $(document).trigger("selectiondown", touch);
      }
      else{
        rangy.getSelection().removeAllRanges();
        alreadyDeselected = true;
      }
    }
  });


  $(document).bind("movefingermove",function(e, touch){
    if(selecting){
      unhighlight();
      hack_smovecnt++;
      createSelectionFromPoints(touch.pageX, touch.pageY);
      $(document).trigger("selectionmove", touch);
    }
  });

  $(document).bind("movefingerup",function(e, touch){
    if(selecting){
      createSelectionFromPoints(touch.pageX, touch.pageY);
      selecting = false;
      if(hack_smovecnt > 0)
        hack_smovecnt =0;
     $(document).trigger("selectionup", touch);
   }
  });
}