var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var mqtt = require('mqtt');
var url = require('url');
var sys = require('sys');
var net = require('net');
var bodyParser = require('body-parser');
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '5mb'
}));
app.use(bodyParser.json({limit: '50mb'}));
    

app.use(express.static(__dirname + '/public'));
app.use('/node_modules/dist', express.static(__dirname + '/node_modules/bootstrap/dist'))
    .use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'))
    .use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'))
    .use('/fonts', express.static(__dirname + '/node_modules/bootstrap/dist/fonts'));
app.use('/libs', express.static(__dirname + '/public/libs'))
    .use('/css', express.static(__dirname + '/public/libs/css'));
// Parse 
var mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://iljmaxro:5UFojSFjKFnB@m13.cloudmqtt.com:13024');
var auth = (mqtt_url.auth || ':').split(':');
var url = "mqtt://" + mqtt_url.host;

var options = {
  port: mqtt_url.port,
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  username: auth[0],
  password: auth[1],
};

// Create a client connection
var client = mqtt.connect(url, options);
//var client = new mqtt.MQTTClient(1883, '127.0.0.1', 'pusher');
 
io.sockets.on('connection', function (socket) {
  socket.on('subscribe', function (data) {
    console.log('Subscribing to '+data.topic);
    //client.subscribe(data.topic);
  });
});
 
// client.addListener('mqttData', function(topic, payload){
//   sys.puts(topic+'='+payload);
//   io.sockets.emit('mqtt',{'topic':String(topic),
//     'payload':String(payload)});
// });

client.on('connect', function() { // When connected

  // subscribe to a topic
  client.subscribe('esp8266_arduino_out', function() {
    // when a message arrives, do something with it
    client.on('message', function(topic, message, packet) {
      var values = message.toString().split(";");
      console.log(values);
      if(values.length > 0 && values[0] <= '9'){
        io.sockets.emit('mqtt',{'topic':String(topic), 'type':String(values[0]),  'payload':String(values[1])});
      }
      
      //io.emit('an event sent to all connected clients');
      console.log("Received '" + message + "' on '" + topic + "'");
    });
  });

  // publish a message to a topic
  // client.publish('esp8266_arduino_in', 'my message', function() {
  //   console.log("Message is published from node.js");
  //   //client.end(); // Close the connection when published
  // });
});

var fs = require("fs");

var fileinput = path.join(__dirname, '/data/input.txt');
var fileprocess = path.join(__dirname, '/data/process.txt');

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/garden', function(request, response) {
  fs.readFile(fileinput, function (err, data) {
      if (err) {
          return console.error(err);
      }
      console.log("Asynchronous read: " + data.toString());
      var values = data.toString().split(";");
      var datainput = {};
      if(values.length >= 4){
        datainput.relaynumber = values[1];
        datainput.ontime = values[2];
        datainput.typeofftime = values[3];
        datainput.offtime = values[4];
      }
      //var str = "1;" + req.body.relaynumber + ";"  + req.body.ontime + ";"  + req.body.typeofftime + ";"  + req.body.offtime;
      //response.render('pages/garden', datainput);
      response.render('pages/garden', {
                            setting: datainput
                        }); 
  });
});

app.get('/home', function(request, response) {
    fs.readFile(fileinput, function (err, data) {
        if (err) {
            return console.error(err);
        }
        console.log("Asynchronous read: " + data.toString());
        var values = data.toString().split(";");
        var datainput = {};
        if(values.length >= 4){
          datainput.relaynumber = values[1];
          datainput.ontime = values[2];
          datainput.typeofftime = values[3];
          datainput.offtime = values[4];
        }
        
        response.render('pages/johnview', {
                              setting: datainput
                          }); 
    });
  });

app.get('/test', function(request, response) {
  response.send({message:'hello world'});
});

app.get('/testmqtt/:message', function(req, res){
    // publish a message to a topic
  client.publish('esp8266_arduino_in', 'my message:' + req.params.message, function() {
    console.log("Message is published from node.js");
    //client.end(); // Close the connection when published
    res.send({message:'Message published'});
  });


})

// app.get('/status', function(req, res){
 
//     fs.readFile(fileprocess, function (err, data) {
//         if (err) {
//             return console.error(err);
//         }
//         console.log("Asynchronous read: " + data.toString());
//         res.send('process: ' + data.toString());
//     });
//     /*
//     res.json({
//         message: 'from test',
//         query : query
//     });
//     */
// });


app.get('/output', function(req, res){
 

    // Asynchronous read
    fs.readFile(fileinput, function (err, data) {
        if (err) {
            return console.error(err);
        }
        console.log("Asynchronous read: " + data.toString());

         var query = req.query;    
    
        console.log('request from client: ', req.query );

        if(req.query.value){
            console.log(req.query.value);
            fs.writeFile(fileprocess, req.query.value,  function(err) {
                if (err) {
                    return console.error(err);
                }
            });
        }
        var values = data.split(";");
        if(values){

        }

        res.send(data.toString());
        
    });   

    /*
    res.json({
        message: 'from test',
        query : query
    });
    */
});


app.post('/input', function(req, res){
    if(req.query.value){
        console.log(req.query.value);
        fs.writeFile(fileinput, req.query.value,  function(err) {
            if (err) {
                return console.error(err);
            }
            
            console.log("Data written successfully!");
            console.log("Let's read newly written data");
            fs.readFile(fileprocess, function (err, data) {
                if (err) {
                    return console.error(err);
                }
                console.log("Asynchronous read: " + data.toString());
                res.send('process: ' + data.toString());
            });
        });
    }
});

// app.post('/changerelay',function(req, res){
//   console.log(req.body);
//   if(req.body.message){
//     client.publish('esp8266_arduino_in', req.body.message, function() {
//       console.log("Message is published from node.js");
//       //client.end(); // Close the connection when published
//       //res.redirect('/garden');
//     });
//   }
// });
app.post('/on', function(req, res){
    console.log(req.body);
    var messageSend = req.body.pinno + ";" +req.body.value;
    client.publish('esp8266_arduino_in', messageSend, function() {
        console.log("ON:Message is published from node.js");
        console.log(messageSend);
        //client.end(); // Close the connection when published
        res.redirect('/garden');
    });
});
app.post('/off', function(req, res){
    console.log(req.body);    
    var messageSend = req.body.pinno + ";" + req.body.value;
    client.publish('esp8266_arduino_in', messageSend, function() {
        console.log("OFF:Message is published from node.js");
        console.log(messageSend);
        //client.end(); // Close the connection when published
        res.redirect('/garden');
  });
});
app.get('/status', function(req, res){
  client.publish('esp8266_arduino_in', '9', function() {
    console.log("Message is published from node.js");
    //client.end(); // Close the connection when published
    //response.send({message:'Message published'});
  });
});
app.post('/setting', function(req, res){
  console.log(req.body);
  if(req.body.relaynumber && req.body.ontime && req.body.typeofftime && req.body.offtime){
        var str = "1;" + req.body.relaynumber + ";"  + req.body.ontime + ";"  + req.body.typeofftime + ";"  + req.body.offtime;
        console.log(str);
        fs.writeFile(fileinput, str,  function(err) {
            if (err) {
                return console.error(err);
            }
            
            console.log("Data written successfully!");
            console.log("Let's read newly written data");
        });
        client.publish('esp8266_arduino_in', str, function() {
            console.log("Message is published from node.js");
            //client.end(); // Close the connection when published
            //response.send({message:'Message published'});
            res.redirect('/garden');
        });
    }
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

