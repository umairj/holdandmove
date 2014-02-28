/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    27.02.14
 */


(function () {

    var selection = null;

    function highlight () {
        document.designMode = "on";
        if (!document.execCommand("HiliteColor", false, 'blue')) {
            document.execCommand("BackColor", false, 'blue');
        }

        document.designMode = "off";
    }





    window.addEventListener('load', function () {
        var debug = document.getElementById('debug');

        var selection = window.getSelection();

        var elem1 = document.getElementById('testelement1');
        var elem2 = document.getElementById('testelement3');

        var selection = window.getSelection();

        console.log(document.activeElement);


        var range = document.createRange();
        range.setStart(elem1.firstChild, 0);
        range.setEnd(elem1.firstChild, elem1.innerHTML.length);


        if (range) {
            selection.removeAllRanges();
            selection.addRange(range);
            highlight();
        }

        selection.removeAllRanges();


        window.addEventListener('touchstart', function (e) {

            selection = document.getSelection();



            debug.innerHTML += selection.anchorNode.data;

            console.log(selection);

        });

        window.addEventListener('mousedown', function (e) {

            selection = document.getSelection();

            console.log(selection);

        });


        window.addEventListener('mouseup', function(e) {
            selection = document.getSelection();

            var span = document.createElement('span');
            span.classList.add('highlight');

            var range = document.createRange();


            var start = selection.anchorOffset, end = selection.focusOffset;

            if(start > end) {
                var tmp = start;
                start = end;
                end = tmp;
            }

            range.setStart(selection.anchorNode, start);
            range.setEnd (selection.anchorNode, end);

            //range.surroundContents(span);

            selection.addRange(range);

            console.log(start + " # "  + end);
            console.log(selection);

        });

    });

})();