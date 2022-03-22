var devConfig = require('./env/config.dev');
var prodConfig = require('./env/config.prod');
var localConfig = require('./env/config.local');
var stgConfig = require('./env/config.stg');


var config = {
    dev: devConfig,
    prod: prodConfig,
    local: localConfig,
    stg: stgConfig
}

module.exports = {
    config: function () { return config[process.env.NODE_ENV] || config.local }
}