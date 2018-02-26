var express = require('express'),
    env = require('../env'),
    app = express(),
    http = require('http').Server(app),
    port = process.env.PORT || 50000,
    path = require('path'),
   // logger = require('express-logger'),
    mqtt = require('mqtt'),
    url = require('url'),
    sys = require('sys'),
    net = require('net'),
    bodyParser = require('body-parser'),
    io = require('socket.io')(http);

    module.exports = function () {
       // app.use(logger({path: process.env.APP_LOG}));
        app.use(bodyParser.urlencoded({
            extended: true,
            limit: process.env.MAX_JSON_LIMIT
        }));
        app.use(bodyParser.json({limit: process.env.MAX_JSON_LIMIT}));
    }