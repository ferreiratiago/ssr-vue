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
