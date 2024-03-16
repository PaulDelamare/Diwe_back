// Create a Buffer object from a base64 encoded string representing a 1x1 transparent GIF image
const transparentImage = Buffer.from('R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=', 'base64');

// Define a function that sends the transparent image as a response with the specified status code
const sendTransparentImage = (res, statusCode) => {
    // Set the response status code
    res.status(statusCode);
    // Set the response content type to "image/gif"
    res.set('Content-Type', 'image/gif');
    // Set the response cache control headers to prevent caching of the image
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

     // Send the transparent image as the response body
    res.send(transparentImage);
};

// Export the sendTransparentImage function as a module
module.exports = sendTransparentImage