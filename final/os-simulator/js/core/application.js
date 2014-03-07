

(function (OS) {

    function Application () {}

    Application.prototype  = {

        events: [],

        init: function () {},

        unInit: function () {},

        install: function () {
            OS.setActiveApp(this);
            this.registerEvents();
        },

        uninstall: function () {
            this.unregisterEvents();
            this.unInit();
        },

        registerEvent: function (scope, name, callback) {
            this.events.push({
                scope: scope,
                name: name,
                callback: callback
            });
            $(scope).bind(name, callback);
        },

        registerEvents: function () {},

        unregisterEvents: function () {
            this.events.forEach(function (event) {
                $(event.scope).unbind(event.name, event.callback);
            });
        }
    };

    OS.Application = Application;

})(window.OS);