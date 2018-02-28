module.exports = function (app) {
    var express = require('express');
    var router = express.Router(),
        controllers = require('./controllers')(app);
    
    router.get('/status', controllers.esphandler.statusConnection);
    router.get('/home', controllers.esphandler.ctrl00);
    router.post('/on', controllers.esphandler.onLamp);
    router.post('/off', controllers.esphandler.offLamp);
    return router;
};