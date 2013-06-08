var http = require('http'),
    routes = require('./routes');
var express = require('express');
var app = express();


//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    //res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
}

app.configure( function (){
    app.use(allowCrossDomain);
    app.use( express.logger());
    app.use( express.bodyParser());
    app.use( app.router );
});

app.configure( 'development', function (){
    app.use( express.errorHandler({ dumpExceptions : true, showStack : true }));
});

app.configure( 'production', function (){
    app.use( express.errorHandler());
});

// Routes
var routes = require( './routes' );
app.all('/', routes.empty);
app.get('/api/generate', routes.empty);
app.post('/api/generate', routes.generateZip);
app.options('/api/generate', routes.empty);

// set the server to listen on port `8080`.
//
var server = app.listen( process.env.PORT || 5000);

console.log( 'Express server listening on port %d in %s mode', server.address().port, app.settings.env );