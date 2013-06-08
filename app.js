var http = require('http'),
    routes = require('./routes'),
    director = require('director');

//
// create some logic to be routed to.
//
function empty() {
    this.res.writeHead(200, { 'Content-Type': 'text/plain'
    })
    this.res.end('');
}
function home() {
    this.res.writeHead(302, {
        'Location': 'http://analogj.github.io/web-zipper/'});
    this.res.end();
}
//
// define a routing table.
//
var router = new director.http.Router({
    '/api/generate': {
        post: routes.generateZip,
        get: empty,
        options:  empty
    },
    '/':{
        get: home
    }
});
//
// setup a server and when there is a request, dispatch the
// route that was requested in the request object.
//
var server = http.createServer(function (req, res) {
    // When dealing with CORS (Cross-Origin Resource Sharing)
    // requests, the client should pass-through its origin (the
    // requesting domain). We should either echo that or use *
    // if the origin was not passed.
    var origin = (req.headers.origin || "*");


    // Check to see if this is a security check by the browser to
    // test the availability of the API for the client. If the
    // method is OPTIONS, the browser is check to see to see what
    // HTTP methods (and properties) have been granted to the
    // client.
    if (req.method.toUpperCase() === "OPTIONS"){


        // Echo back the Origin (calling domain) so that the
        // client is granted access to make subsequent requests
        // to the API.
        res.writeHead(
            "204",
            "No Content",
            {
                "access-control-allow-origin": origin,
                "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
                "access-control-allow-headers": "content-type, accept",
                "access-control-max-age": 10, // Seconds.
                "content-length": 0
            }
        );

        // End the response - we're not sending back any content.
        return( res.end() );


    }



    req.chunks = [];
    req.on('data', function (chunk) {
        req.chunks.push(chunk.toString());
    });




    router.dispatch(req, res, function (err) {
        if (err) {
            res.writeHead(404);
            res.end();
        }
    });
});

// set the server to listen on port `8080`.
//
server.listen(process.env.PORT || 5000);