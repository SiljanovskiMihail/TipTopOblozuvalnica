// Import the Express.js library
const express = require('express');
// Create an Express application instance
const app = express();
// Define the port the server will listen on
const PORT = process.env.PORT || 3000; // Use port 3000 by default, or an environment variable

// Serve static files from the current directory (your project root)
// This makes all files in Oblozuvalnica/, including views/public/, directly accessible.
// For example, views/public/css/styles.css will be accessible at /views/public/css/styles.css
app.use(express.static(__dirname));

// Define a route for the root URL ('/')
// When a GET request comes to the root, send the index.html file
app.get('/', (req, res) => {
    // Send your main index.html file
    // __dirname is the current directory of app.js
    res.sendFile(__dirname + '/index.html');
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Press CTRL-C to stop the server');
});
