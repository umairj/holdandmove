/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    06.03.14
 */

function debug(str) {
    $('#debug').prepend(str + '<br/>');
}
try {
(function($) {


    var selecting = false;


    var selection = [];

    var NodeType = {
        element: 1,
        attribute: 2,
        text: 3,
        name: ['','element', 'attribute', 'text']
    };

    function unselectAll (callback) {

        selection.forEach(function (elem) {



            elem.parent.removeChild(elem.span);

            if(!!elem.begin)
                elem.parent.removeChild(elem.begin);
            /*if(!!elem.mid)
                elem.parent.removeChild(elem.mid);*/
            if(!!elem.end)
                elem.parent.removeChild(elem.end);

            if(elem.sibling)
                elem.parent.insertBefore(elem.originalNode, elem.sibling);
            else
                elem.parent.appendChild(elem.originalNode);
        });

        selection.length = 0;



    }

    function encapsulate (node, startOffset, endOffset) {

        var parent = node.parentNode;
        var sibling = node.nextSibling;

        var span = document.createElement('span');
        span.classList.add('capsule');

        var beginNode = null;
        var midNode = null;
        var endNode = null;

        if(!isNaN(startOffset) && !isNaN(endOffset)) {
            var begin = node.data.substring(0, startOffset);
            var mid = node.data.substring(startOffset, endOffset);
            var end = node.data.substring(endOffset, node.data.length);

            beginNode = document.createTextNode(begin);
            midNode = document.createTextNode(mid);
            endNode = document.createTextNode(end);


            parent.insertBefore(beginNode, node);
            if(!!sibling)
                parent.insertBefore(endNode, sibling);
            else
                parent.appendChild(endNode);

            parent.removeChild(node);

            span.appendChild(midNode);
            parent.insertBefore(span, endNode);
        } else {
            span.appendChild(node);
            //parent.removeChild(node);

            if(!!sibling)
                parent.insertBefore(span, sibling);
            else
                parent.appendChild(span);
        }

        selection.push({
            sibling: sibling,
            parent: parent,
            span: span,
            begin: beginNode,
            mid: midNode,
            end: endNode,
            originalNode: node
        });


    }


    function crawl(startNode, targetNode, elementCallback, endCallback,  callerNode) {
        var node = startNode;


        elementCallback(node);



        if(node === targetNode) {
            endCallback();
            return true;
        }


        var childCount = node.childNodes.length;


        if(childCount > 0) {
            var i= 0,
                child = null;
            if(!!callerNode && callerNode != node.parentNode) {
                while(child !== callerNode || i > 100) {
                    child = node.childNodes[i++];
                }
            }
            for(; i<childCount; i++) {
                child = node.childNodes[i];
                if(callerNode !== child) {
                    if(crawl(child, targetNode, elementCallback, endCallback, node))
                        return true;
                }
            }
        }
        if(!!node.parentNode && node.parentNode !== callerNode) {

            if(crawl(node.parentNode, targetNode, elementCallback, endCallback, node))
                return true;
        }

        return false;
    }

    function select (startNode, startOffset, endNode, endOffset) {

        if(!startNode || !endNode) {

            return;
        }


        var textNodes = [];

        selecting = true;

        var elementCallback = function(node) {

            if(node.nodeType == NodeType.text) {
                var data = node.data.replace(/[\s\r\n]/g, '');
                if(data.length > 0 )
                    textNodes.push(node);
            }
        };

        var successCallback = function () {



            textNodes.forEach(function (node) {
                if(node == startNode && node == endNode) {
                    encapsulate(node, startOffset, endOffset);
                }
                else if(node == startNode) {
                    encapsulate(node, startOffset, node.data.length);
                } else if(node == endNode) {
                    encapsulate(node, 0, endOffset);
                } else {
                    encapsulate(node);
                }


            });

            selecting = false;
        };

        if(!crawl(startNode, endNode, elementCallback, successCallback)) {

            selecting = false;
        }






    }

    $(document).ready(function () {

        var startNode = $('#start')[0].firstChild,
            startOffset = 3,
            endNode = $('#end')[0].firstChild,
            endOffset = 7;


        //select(startNode,startOffset, startNode, endOffset);
        //unselectAll();
        //select(startNode,startOffset, endNode, endOffset);
        //unselectAll();

    });


    var selectStart = {
        node: null,
        offset: null,
        pageX: null,
        pageY: null
    };

    var selectEnd = {
        node: null,
        offset: null,
        pageX: null,
        pageY: null
    };

    $(document).on('touchstart', function (event) {
        unselectAll();

        var caret = document.caretRangeFromPoint(event.originalEvent.touches[0].pageX, event.originalEvent.touches[0].pageY);



        selectEnd.node = null;
        selectEnd.offset = null;
        selectStart.node = caret.startContainer;
        selectStart.offset = caret.startOffset;
        selectStart.pageX = event.originalEvent.touches[0].pageX;
        selectStart.pageY = event.originalEvent.touches[0].pageY;

    });

    $(document).on('touchmove', function (event) {


        event.preventDefault();

        window.getSelection().removeAllRanges();





        //debugger;
        unselectAll();


        var caret = document.caretRangeFromPoint(event.originalEvent.touches[0].pageX, event.originalEvent.touches[0].pageY);
        selectEnd.node = caret.startContainer;
        selectEnd.offset = caret.startOffset;
        selectEnd.pageX = event.originalEvent.touches[0].pageX;
        selectEnd.pageY = event.originalEvent.touches[0].pageY;

        if(selectEnd.node.compareDocumentPosition(selectStart.node) & Node.DOCUMENT_POSITION_FOLLOWING ||
            (selectStart.node == selectEnd.node && selectStart.offset > selectEnd.offset))
            select(caret.startContainer, caret.startOffset, selectStart.node, selectStart.offset);
        else
            select(selectStart.node, selectStart.offset, caret.startContainer, caret.startOffset);


    });

    $(document).on('touchend', function (event) {
        var caret = document.caretRangeFromPoint(event.originalEvent.changedTouches[0].pageX, event.originalEvent.changedTouches[0].pageY);



        //select(selectStart.node, selectStart.offset, caret.startContainer, caret.startOffset);

    });

    $(document).on('mousedown', function (event) {

        unselectAll();

        var caret = document.caretRangeFromPoint(event.pageX, event.pageY);



        selectStart.node = caret.startContainer;
        selectStart.offset = caret.startOffset;

    });

    $(document).on('mouseup', function (event) {




        //window.getSelection().removeAllRanges();
        var caret = document.caretRangeFromPoint(event.pageX, event.pageY);


        var oldTime = (new Date()).getTime();
        //select(selectStart.node, 0, caret.startContainer);
        $('body').append('time:' + (new Date()).getTime() - oldTime);
    })



})(jQuery);
} catch (e) {
    debug(e);
}
