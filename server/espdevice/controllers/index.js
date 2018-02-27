var _         = require('lodash'),
esphandler  = require('./esphandler');

module.exports = function(app){
    return {
        esphandler : esphandler(app)
    };
};