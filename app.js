var http = require('http'),
    routes = require('./routes'),
    director = require('director');

//
// create some logic to be routed to.
//
function empty() {
    this.res.writeHead(200, { 'Content-Type': 'text/plain','Access-Control-Allow-Origin' : 'http://analogj.github.io' })
    this.res.end('');
}
function home() {
    this.res.writeHead(302, {'Location': 'http://analogj.github.io/web-zipper/'});
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