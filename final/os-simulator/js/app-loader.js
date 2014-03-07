/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    07.03.14
 */


(function($){

    function AppLoader (param) {
        this.container = param.container;
        this.$container = $(this.container);
    }

    AppLoader.prototype = {

        container: null,

        $container: null,

        load: function (appname) {
            // clear the app container
            this.$container.html('');

            // get the config file for the app
            var uri = "../apps/" + appname + "/app.json";
            $.get(uri, function (data) {
                console.log(data);

            });
        }

    };

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }



    var appLoader = null;
    var $contentWrapper = null;

    $(window).load(function () {

        $contentWrapper = $('#content-wrapper');

        appLoader = new AppLoader($contentWrapper);

        // get the current app name
        var activeAppName = getParameterByName('active_app')
        appLoader.load('div');

    });



})(jQuery);