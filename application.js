/**
 * Application.js Where it all begins
 * @type {*|exports|module.exports}
 */

//setup our require
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

//setup our express app
var app = express();

//setup socket.io
var server = http.createServer(app);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//allows us to get the client's ip
app.enable('trust proxy');

//setup our static files
app.use('/', express.static('public'));
app.use('/docs', express.static('docs'));

//setup our user routes
app.use('/api/v1/user/auth', require('./routes/user/auth'));


//setup for deployment on openshift
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");

server.listen(app.get('port'), app.get('ip'), function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});