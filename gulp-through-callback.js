'use strict';
const through = require('through2');

const plugin = (callback) => {
    return through.obj((file, enc, cb) => {
        callback(file);
        cb();
    });
};

module.exports = plugin;
