

(function ($, OS) {

    function DemoApp () {}

    DemoApp.prototype = new OS.Application();

    $.extend(DemoApp.prototype, {
        registerEvents: function () {
            var that = this;

            console.log('test');

            this.registerEvent(window, 'click', function () {
                alert('yo');

                that.uninstall();

            });

        }
    });

    var demoApp = new DemoApp();

    demoApp.install();

    console.log(demoApp);

})(jQuery, window.OS);