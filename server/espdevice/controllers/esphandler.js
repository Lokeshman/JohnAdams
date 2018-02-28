module.exports = function (app) {
    var _ = require('lodash'),
        crypto = require('crypto'),
        fileinput = app.get('fileinput'),
        fileprocess = app.get('fileprocess'),
        mqtt = require('mqtt'),        
        url = require('url'),
        path = require('path'),
        fs = require("fs"),
        http = require('http').Server(app),
        io = require('socket.io')(http);

    var mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://iljmaxro:5UFojSFjKFnB@m13.cloudmqtt.com:13024');
    var auth = (mqtt_url.auth || ':').split(':');
    var url = "mqtt://" + mqtt_url.host;
    
    var options = {
        port: mqtt_url.port,
        clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
        username: auth[0],
        password: auth[1],
    };    

    var client = mqtt.connect(url, options);

    io.sockets.on('connection', function (socket) {
        socket.on('subscribe', function (data) {
            console.log('Subscribing to '+data.topic);
            //client.subscribe(data.topic);
        });
    });

    client.on('connect', function() { // When connected
    
    // subscribe to a topic
    client.subscribe('esp8266_arduino_out', function() {
        // when a message arrives, do something with it
        client.on('message', function(topic, message, packet) {
        var values = message.toString().split(";");
        console.log(values);
        if(values.length > 0 && values[0] <= '9'){
            io.sockets.emit('mqtt', 
            {   
                'topic'     :   String(topic), 
                'type'      :   String(values[0]),  
                'payload'   :   String(values[1])
            });
        }        
        //io.emit('an event sent to all connected clients');
        console.log("RECEIVED '" + message + "' ON '" + topic + "'");
        });
    });
    
    // publish a message to a topic
    // client.publish('esp8266_arduino_in', 'my message', function() {
    //   console.log("Message is published from node.js");
    //   //client.end(); // Close the connection when published
    // });
    });

    return {
        statusConnection: function(req, res){
            client.publish('esp8266_arduino_in', '9', function() {
              console.log("Message is published from node.js");
              //client.end(); // Close the connection when published
              //response.send({message:'Message published'});
            });
        },
        ctrl00: function(request, response) {
            console.log(fileinput);  
               
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
                
                response.render('espdevice/pages/johnview', {
                    setting: datainput
                }); 
            });               
        },
        onLamp: function(req, res){
            console.log(req.body);
            var messageSend = req.body.pinno + ";" + req.body.value;
            client.publish('esp8266_arduino_in', messageSend, function() {
                console.log("ON:Message is published from node.js");
                console.log(messageSend);
                //client.end(); // Close the connection when published
                res.redirect('/home');
            });
        },
        offLamp: function(req, res){
            console.log(req.body);    
            var messageSend = req.body.pinno + ";" + req.body.value;
            client.publish('esp8266_arduino_in', messageSend, function() {
                console.log("OFF:Message is published from node.js");
                console.log(messageSend);
                //client.end(); // Close the connection when published
                res.redirect('/home');
          });
        }
    }
}

