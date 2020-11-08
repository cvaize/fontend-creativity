'use strict';
const fs = require('fs');
const path = require('path');
const through = require('through2');
const vinylFile = require('vinyl-file');
const crypto = require('crypto');
const sortKeys = require('sort-keys');
const Vinyl = require('vinyl');

function hash(input) {
    if (typeof input !== 'string' && !Buffer.isBuffer(input)) {
        throw new TypeError('Expected a Buffer or string');
    }

    return crypto.createHash('md5').update(input).digest('hex');
}

const getManifestFile = opts => vinylFile.read(opts.path, opts).catch(error => {
    if (error.code === 'ENOENT') {
        return new Vinyl(opts);
    }

    throw error;
});


const plugin = (pth, opts) => {
    if (typeof pth === 'string') {
        pth = {path: pth};
    }

    opts = Object.assign({
        path: 'manifest.json',
        transformer: JSON,
        publicPath: './',
        cwd: process.cwd()
    }, opts, pth);

    return through.obj((file, enc, cb) => {

        if (!file.path) {
            cb();
            return;
        }
        const extname = path.extname(file.path)
        if (extname === '.map') {
            cb();
            return;
        }

        let manifest = {};

        const dirname = path.dirname(file.path)
        const basename = path.basename(file.path)
        const manifestPath = path.join(dirname, opts.path).replace(/\\/g, '/');
        const publicPath = path.join(opts.cwd, opts.publicPath).replace(/\/$/g, '')
        const originalFile = path.join(dirname, basename).replace(/\\/g, '/').replace(publicPath, '');

        manifest[originalFile] = originalFile+'?id='+hash(file.contents);

        let oldManifest = {}
        try {
            if(fs.existsSync(manifestPath)){
                oldManifest = opts.transformer.parse(fs.readFileSync(manifestPath, 'utf-8'))
            }
        } catch (_) {}

        manifest = Object.assign(oldManifest, manifest);

        fs.writeFileSync(manifestPath, opts.transformer.stringify(manifest,null,2))

        cb();
    });
};

module.exports = plugin;
