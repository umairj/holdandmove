/**
 * @project holdnmove
 * @file
 * @author  Jonas Köhler
 * @date    07.03.14
 */


(function($, OS){

    var appLoader = null;
    var $contentWrapper = null;

    $(window).load(function () {

        OS.$contentContainer = $('.content-wrapper');
        OS.$widgetContainer = $('.widget-wrapper');

        OS.$widgetContainer.on('touchstart', function (){
            if(!OS.activeApp)
                OS.loadApp('new-drawing');
            else
                OS.unloadApp();
        })
    });



})(jQuery, window.OS);