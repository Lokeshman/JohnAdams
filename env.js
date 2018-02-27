//Configuration
process.env['PORT'] = 5000;
process.env['APP_LOG_FOLDER'] = 'logs'; 
process.env['APP_LOG'] = 'logs/logfile.txt'; 
process.env['MAX_JSON_LIMIT'] = '50mb'; 
process.env['REQUEST_MAX_AGE_IN_SECONDS'] = 300; 
process.env['MAX_TOKEN_AGE_IN_SECONDS'] = 900; //15 minutes
process.env['POLLING_CRON_TIME'] = 5;
//Links follow by Lokesh version **
process.env['SOCKET_CONNECT_URL'] = 'https://loinguyen-room-nhs.herokuapp.com';
process.env['CLOUDMQTT_URL'] = 'mqtt://iljmaxro:5UFojSFjKFnB@m13.cloudmqtt.com:13024';
process.env['TOPIC_SUBSCRIBE'] = 'esp8266_arduino_out';
