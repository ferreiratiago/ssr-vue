// src/app.js
(function () {
    'use strict';

    var createApplication = function () {
        // It must return the Vue instance with a root node
        // with "app" id, so the client-side version can
        // take over once it loads.
        return new Vue({
            template: '<div id="app">You have killed {{ kittens }} kittens!</div>',
            data: {
                kittens: 0
            },
            // Called synchronously after the Vue instance is created
            created: function () {
                var v = this;

                setInterval(function () {
                    v.kittens += 1;
                }, 1000);
            }
        });
    }

    // We first check if we are on the server-side version
    // by checking on module and it's exports.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = createApplication;
    }
    // Otherwise, it means that we are on the cliend-side,
    // which in this case we want to assign our application
    // to the browser window (e.g. this).
    else {
        this.app = createApplication()
    }
}).call(this);
