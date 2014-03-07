/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    07.03.14
 */
/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    07.03.14
 */

(function ($) {

    var iframe;
    window.addEventListener('load', function () {
        iframe = document.getElementById('frame');
        iframe.width = window.innerWidth * 0.8;
        iframe.height = window.innerHeight;

        iframe.contentWindow.setSuperWindow(this)

        window.println = function (message) {
            var sidebar = document.getElementById('sidebar');

            sidebar.innerHTML = "<p>" + message + "</p>";
        };

        window.println('asdf');

        $(window).on('touchmove', function (e) {
            console.log(e);
            window.println(e.originalEvent.touches[0].pageX);
        });

        alert('yo');

    });




})(jQuery);
