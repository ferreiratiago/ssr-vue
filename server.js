// server.js
const fs = require('fs');
const path = require('path');

// Define global Vue for server-side app.js
// This will allow to create a new instance of Vue
// on node.js (i.e. new Vue on src/app.js).
global.Vue = require('vue');

// Get HTML layout
const layout = fs.readFileSync('./index.html', 'utf8');

// Split layout into two sections of HTML
const layoutSections = layout.split('<div id="app"></div>');
const preAppHTML = layoutSections[0];
const postAppHTML = layoutSections[1];

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
    // Render our Vue app to a stream
    const stream = rendered.renderToStream(require('./src/app')());

    // Write our pre-app HTML to the response
    response.write(preAppHTML);

    stream.on('data', function (chunk) {
        // Write data to the response
        // as it becomes available
        response.write(chunk);
    });

    // When all chuncks are rendered
    stream.on('end', function (chunk) {
        // Write our post-app HTML to the response
        response.end(postAppHTML);
    });

    // If an error occurs
    stream.on('error', function (error) {
        // Log it into the console
        console.log('error');
        // Tell the client that something went wrong
        return response
            .status(500)
            .send('Server Error');
    });
});

// Listen on port 5000
server.listen(5000, function (error) {
    if (error) {
        throw error;
    }
    console.log('Server running at localhost:5000');
});
