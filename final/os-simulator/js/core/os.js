(function ($) {

    window.OS = {

        appDir : "../apps/",

        plugins : {},

        activeApp: null,
        boundScripts: [],
        boundStylesheets: [],


        contentContainer : null,
        $contentContainer : null,

        widgetContainer : null,
        $widgetContainer : null,

        setActiveApp: function (app) {
            this.activeApp = app;
            console.log(app);
        },

        removeAllContents: function () {
            this.$contentContainer.empty();
            this.boundScripts.forEach(function (script) {
                $(script).remove();
            });
            this.boundStylesheets.forEach(function (style) {
                $(style).remove();
            });
        },

        unloadApp: function () {
            if(!!this.activeApp) {

                this.activeApp.uninstall();
                this.removeAllContents();

                this.activeApp = null;
            }
        },

        loadApp: function (appname) {

            var that = this;

            this.unloadApp();

            var uri = this.appDir + appname + '/app.json';

            $.get(uri, function (data) {

                // load the javascript
                data.javascript.forEach(function(script) {
                    var scriptUri = that.appDir + appname + '/' + script;
                    var $script = $(document.createElement('script'));
                    $script.attr('src', scriptUri);
                    $('body').append($script);
                    that.boundScripts.push($script);
                });

                // load the stylesheets
                data.stylesheet.forEach(function(style) {
                    var styleUri = that.appDir + appname + '/' + style;
                    var $style = $(document.createElement('link'));
                    $style.attr('rel', 'stylesheet');
                    $style.attr('href', styleUri);
                    $('head').append($style);
                    that.boundStylesheets.push($style);
                });

                // load the dom content
                var index = 0;
                data.html.forEach(function(html) {
                    var htmlUri = that.appDir + appname + '/' + html;
                    $.get(htmlUri, function (content) {
                        that.$contentContainer.append(content);
                        if(index++ >= data.html.length-1) {
                            console.log('test');
                            that.activeApp.init();
                        }
                    });
                });
            });
        }



    };

})(jQuery);

