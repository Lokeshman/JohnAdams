var express = require('express'),    
    app     = express(),
    http    = require('http').Server(app),
    engine  = require('ejs-locals'),    
    path    = require('path'),
    net     = require('net'),
    io      = require('socket.io')(http);
   // logger = require('express-logger'),  
    // sys = require('sys'),
    bodyParser = require('body-parser');    
    
    var port = process.env.PORT || 8080;

      
    app.set('fileinput', path.join(__dirname, '../data/input.txt')); 
    app.set('fileprocess', path.join(__dirname, '../data/process.txt')); 

    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '5mb'
    }));

    app.use(bodyParser.json({limit: '50mb'}));   
    
    module.exports = function () {

        app.set('views', path.join(__dirname, '/views'));              
        app.engine('ejs', engine);
        app.set('view engine', 'ejs'); // set up ejs for templating

        app.use(express.static(path.join(__dirname, '../public')));
        
        console.log(path.join(__dirname + '../node_modules/bootstrap/dist/css'));        
    
        //app.use(express.static(path.join(__dirname, '../node_modules')));

        app.use('/libs', express.static(path.join(__dirname, '../node_modules/bootstrap/dist')))
            .use('/css', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/css')))
            .use('/js', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/js')))
            .use('/fonts', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/fonts')));

        app.use('/libs', express.static(path.join(__dirname, '../public/libs')))
            .use('/css', express.static(path.join(__dirname, '../public/libs/css')))
            .use('/js', express.static(path.join(__dirname, '../public/libs/js')));

        app.use(bodyParser.urlencoded({
            extended: true,
            limit: process.env.MAX_JSON_LIMIT
        }));
        app.use(bodyParser.json({limit: process.env.MAX_JSON_LIMIT}));

        app.get('/', function(request, response) {
            response.render('pages/index');
          });

        app.use('/', require('./espdevice')(app));

        http.listen(port, function() {
            console.log('Node app is running on port', port);
        });
    }
