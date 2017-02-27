We will explore SSR with Vue 2.0 with Express Web Server

## Vue Application

The first step would be to create our app (`src/app.js`).

We would create a Vue instance and assign it to our server (when on the server-side),
or to our browser window (when on client-side).

The reason for this is that our `app.js` code will run on both side:
* `Server`: for all GET requests on routing;
* `Client`: for Vue to work properly;

```js
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
```

As now we are ready to build our `index.html`:

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Vue SSR</title>
        <script src="src/vue.js" charset="utf-8"></script>
    </head>
    <body>
        <!-- Element where Vue will run -->
        <div id="app"></div>
        <script src="src/app.js" charset="utf-8"></script>
        <script type="text/javascript">
            // Mount app (defined on browser window on src/app.js)
            // on the element with 'app' id.
            app.$mount('#app');
        </script>
    </body>
</html>
```

## Express Server

Although our application works properly as a client-side application
we are missing out server.

In fact, it would be our server that will make sense to our goal of SSR.
Therefore we now create our express server:

```js
// server.js
const fs = require('fs');
const path = require('path');

// Define global Vue for server-side app.js
// This will allow to create a new instance of Vue
// on node.js (i.e. new Vue on src/app.js).
global.Vue = require('vue');

// Get HTML layout
let layout = fs.readFileSync('./index.html', 'utf8');

// Create the server renderer
const rendered = require('vue-server-renderer').createRenderer();

// Create a express server
const express = require('express');
const server = express();

// Serve file from src directory
server.use('/src', express.static(
    path.resolve(__dirname, 'src')
));

// Handle all GET requests
server.get('*', function (request, response) {
    // On GET request
    // Render our Vue application to string
    rendered.renderToString(
        // Create a Vue instance
        require('./src/app')(),
        // Handle rendered result
        function (error, html) {
            // If an error on rendering
            if(error) {
                console.log(error);
                // Tell the client that something went wrong
                return response.status(500).send('Server Error');
            }
            // Send the layout with the rendered HTML to the client
            response.send(layout.replace('<div id="app"></div>', html));
        }
    )
});

// Listen on port 5000
server.listen(5000, function (error) {
    if (error) {
        throw error;
    }
    console.log('Server running at localhost:5000');
});
```

We are not ready to serve our application through SSR.

## Overview

If we design a schema with what's happening that's how it would look something like this:
