/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    07.03.14
 */


(function($, OS){

    function AppLoader (param) {
        this.container = param.container;
        this.$container = $(this.container);
    }

    AppLoader.prototype = {

        container: null,

        $container: null,

        load: function (appname) {

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

        OS.$contentContainer = $('#content-wrapper')

        OS.loadApp('demo');

        $(window).on('dblclick', function (){
            OS.loadApp('demo');
        })
    });



})(jQuery, window.OS);