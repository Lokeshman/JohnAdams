module.exports = function (app) {
    var express = require('express');
    var router = express.Router(),
        controllers = require('./controllers')(app);

    router.get('/home', controllers.esphandler.ctrl00);
    
    return router;
};