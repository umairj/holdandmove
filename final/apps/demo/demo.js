

(function ($, OS) {

    function DemoApp () {}

    DemoApp.prototype = new OS.Application();

    $.extend(DemoApp.prototype, {

        $wrapper: null,

        init: function () {

            $wrapper = $('#wrapper');

            if(!!OS.plugins.mobileRestore) {
                OS.plugins.mobileRestore.activate($wrapper[0]);
            }
        },

        unInit: function() {
            if(!!OS.plugins.mobileRestore) {
                OS.plugins.mobileRestore.deactivate();
            }
        },

        registerEvents: function () {
            var that = this;


        }
    });

    var demoApp = new DemoApp();

    demoApp.install();

})(jQuery, window.OS);