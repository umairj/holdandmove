/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    04.03.14
 */

(function () {

    var startNode = null,
        startOffset = 0;

    function select(startNode, startOffset, endNode, endOffset) {

        var range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);


        highlightRange(range, 'red');

    }

    function debug(str) {
        var elem = document.getElementById('debug');
        elem.innerHTML = "<p>" + str + "</p>";
    }

    function createSelectionFromPoints(endX, endY) {
        var doc = document;
        var end, range = null;


        var sel = rangy.getSelection();
        sel.removeAllRanges();
        //sel.restoreCharacterRanges($(TextID)[0], startOffset);

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
        //textrange.selectNodeContents(document.getElementById('text'));
        //range = range.intersection(textrange);

        //highlight the range
        cssApplier = rangy.createCssClassApplier(SelectionClass, {normalize: true});
        cssApplier.applyToRange(range);

        //create a selection
        var selection = rangy.getSelection();
        selection.setSingleRange(range);
    }

    function highlightRange(range, color) {
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.designMode = "on";
        if (!document.execCommand("HiliteColor", false, color)) {
            document.execCommand("BackColor", false, color);
        }

        document.activeElement.blur();
        window.focus();

        document.designMode = "off";
        window.getSelection().removeAllRanges();
    }

    window.addEventListener('touchstart', function (event) {

        event.preventDefault();

        var selection = window.getSelection();

        selection = document.caretRangeFromPoint(event.touches[0].pageX, event.touches[0].pageY);

        startOffset = selection.startOffset;
        startNode = selection.startContainer;



    });

    var selectionStartNode,
        selectionStartOffset,
        selectionEndNode,
        selectionEndOffset;

    window.addEventListener('touchmove', function (event) {

        event.preventDefault();
        var sel = rangy.getSelection();

        console.log(sel);

        var selection = window.getSelection();



        selectionStartNode = selection.anchorNode;
        selectionStartOffset = selection.anchorOffset;
        selectionEndNode = selection.focusNode;
        selectionEndOffset = selection.focusOffset;

        selection = document.caretRangeFromPoint(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
        createSelectionFromPoints(event.changedTouches[0].pageX,event.changedTouches[0].pageY);

        //debug(selection.anchorOffset);




    });

    window.addEventListener('touchend', function (event) {

        event.preventDefault();

        var selection = window.getSelection();



        selection = document.caretRangeFromPoint(event.changedTouches[0].pageX, event.changedTouches[0].pageY);


        createSelectionFromPoints(event.changedTouches[0].pageX,event.changedTouches[0].pageY);
        select(startNode, startOffset, selection.startContainer, selection.startOffset);

        selectionStartNode = selection.anchorNode;
        selectionStartOffset = selection.anchorOffset;
        selectionEndNode = selection.focusNode;
        selectionEndOffset = selection.focusOffset;

    });
})();