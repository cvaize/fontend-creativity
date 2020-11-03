'use strict';
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
        public: '',
        merge: false,
        transformer: JSON
    }, opts, pth);

    let manifest = {};

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
        const originalFile = path.join(opts.public, path.basename(file.path)).replace(/\\/g, '/');

        manifest[originalFile] = originalFile+'?id='+hash(file.contents);
        cb();
    }, function (cb) {
        // No need to write a manifest file if there's nothing to manifest
        if (Object.keys(manifest).length === 0) {
            cb();
            return;
        }

        getManifestFile(opts).then(manifestFile => {
            if (opts.merge && !manifestFile.isNull()) {
                let oldManifest = {};

                try {
                    oldManifest = opts.transformer.parse(manifestFile.contents.toString());
                } catch (_) {}

                manifest = Object.assign(oldManifest, manifest);
            }

            manifestFile.contents = Buffer.from(opts.transformer.stringify(sortKeys(manifest), null, '  '));
            this.push(manifestFile);
            cb();
        }).catch(cb);
    });
};

module.exports = plugin;
