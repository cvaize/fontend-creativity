const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const _ = require('lodash');
const {terser} = require('rollup-plugin-terser');
const minimatch = require("minimatch");
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');
const magicImporter = require('node-sass-magic-importer');
const watch = require('gulp-watch');
const using = require('gulp-using');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const minifyCss = require('gulp-clean-css');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const manifest = require('./gulp-manifest');
const throughCallback = require('./gulp-through-callback');
const browserSync = require('browser-sync').create();
sass.compiler = require('node-sass');

let srcScssPath = path.resolve('./resources/sass/components');
let srcScssPathWithExt = path.join(srcScssPath, '/**/*.scss');
let destCssPath = path.resolve('./public/css/components/');
let srcJsPath = path.resolve('./resources/js/components/*.js');
let destJsPath = path.resolve('./public/js/components/');
let publicPath = path.resolve('./public');

// https://github.com/kenangundogan/gulpSassCompiler
function combineSass(input){
    return input
        .pipe(sourcemaps.init())
        .pipe(sass({
            importer: magicImporter(),
            includePaths: ['node_modules'],
        }).on('error', sass.logError))
        .pipe(using({color: 'green'}))
        .pipe(minifyCss())
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(destCssPath))  // write css to build dir
        .pipe(manifest({
            public: destCssPath.replace(publicPath, ''),
            path: 'mix-manifest.json',
            merge: true // Merge with the existing manifest if one exists
        }))
        .pipe(gulp.dest(destCssPath));  // write manifest to build dir
}

// https://www.npmjs.com/package/gulp-better-rollup
function combineJs(input){
    return input
        .pipe(sourcemaps.init())
        .pipe(rollup({
            // There is no `input` option as rollup integrates into the gulp pipeline
            plugins: [
                resolve({ browser: true }),
                commonjs(),
                terser()
            ]
        }, {
            // Rollups `sourcemap` option is unsupported. Use `gulp-sourcemaps` plugin instead
            format: 'cjs',
        }))
        // inlining the sourcemap into the exported .js file
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(destJsPath)) // write js to build dir
        .pipe(manifest({
            public: destCssPath.replace(publicPath, ''),
            path: 'mix-manifest.json',
            merge: true // Merge with the existing manifest if one exists
        }))
        .pipe(gulp.dest(destJsPath));  // write manifest to build dir
}

gulp.task('js', function () {
    return combineJs(gulp.src(srcJsPath));
});

gulp.task('sass', function () {
    return combineSass(gulp.src(srcScssPath));
});


gulp.task('sass:watch', function () {
    let scssComponents = {}
    let scssWatchFiles = {}
    let watchInstance
    let unwatch = function (path){
        let changed = [];
        if(scssComponents[path]){
            for (let i = 0; i < scssComponents[path].includeFiles.length; i++) {
                let includeFile = scssComponents[path].includeFiles[i]
                if(scssWatchFiles[includeFile]){

                    scssWatchFiles[includeFile].components = _.remove(scssWatchFiles[includeFile].components, function(n) {
                        return n === path;
                    });

                    if(!scssWatchFiles[includeFile].components.length && scssWatchFiles[includeFile].watch){
                        scssWatchFiles[includeFile].watch = false
                        watchInstance.unwatch(includeFile)
                    }
                }
            }
        }
        if(scssWatchFiles[path]){
            scssWatchFiles[path].watch = false
            for (let i = 0; i < scssWatchFiles[path].components.length; i++) {
                if(scssComponents[scssWatchFiles[path].components[i]]){
                    _.pull(scssComponents[scssWatchFiles[path].components[i]].includeFiles, path)
                }
            }
            changed = scssWatchFiles[path].components;
        }
        watchInstance.unwatch(path)
        return changed;
    }
    let watchCallback = function (vinyl){
        if (!vinyl || vinyl.type === 'deleted' || vinyl.event === 'unlink') {
            if(vinyl.history[0]){
                unwatch(vinyl.history[0])
            }
            return true
        }
        if(minimatch(vinyl.path, srcScssPathWithExt)){
            if(!scssComponents[vinyl.path]){
                scssComponents[vinyl.path] = {
                    includeFiles: [],
                }
            }
            sass.compiler.render({
                file: vinyl.path,
                importer: magicImporter(),
                includePaths: ['node_modules'],
            }, function(err, result) {
                let scssNewIncludeFiles = result.stats.includedFiles.filter(includedFile => !includedFile.includes('node_modules') && !includedFile.includes(srcScssPath))
                let scssOldIncludeFiles = _.difference(scssComponents[vinyl.path].includeFiles, scssNewIncludeFiles);

                scssComponents[vinyl.path].includeFiles = scssNewIncludeFiles

                for (let i = 0; i < scssNewIncludeFiles.length; i++) {
                    let scssNewIncludeFile = scssNewIncludeFiles[i]
                    if(!scssNewIncludeFile){
                        continue;
                    }
                    if(!scssWatchFiles[scssNewIncludeFile]){
                        scssWatchFiles[scssNewIncludeFile] = {
                            components: [],
                            watch: null
                        }
                    }
                    if(!scssWatchFiles[scssNewIncludeFile].components.includes(vinyl.path)){
                        scssWatchFiles[scssNewIncludeFile].components.push(vinyl.path)
                    }
                    if(!scssWatchFiles[scssNewIncludeFile].watch){
                        scssWatchFiles[scssNewIncludeFile].watch = true
                        watchInstance.add(scssNewIncludeFile)
                    }

                }
                for (let i = 0; i < scssOldIncludeFiles.length; i++) {
                    let scssOldIncludeFile = scssOldIncludeFiles[i]
                    if(!scssOldIncludeFile){
                        continue;
                    }
                    if(scssWatchFiles[scssOldIncludeFile]){
                        scssWatchFiles[scssOldIncludeFile].components = _.remove(scssWatchFiles[scssOldIncludeFile].components, function(n) {
                            return n === vinyl.path;
                        });
                        if(!scssWatchFiles[scssOldIncludeFile].components.length && scssWatchFiles[scssOldIncludeFile].watch){
                            scssWatchFiles[scssOldIncludeFile].watch = false
                            watchInstance.unwatch(scssOldIncludeFile)
                        }
                    }
                }
            })
            combineSass(gulp.src(vinyl.path));
        }
        if(scssWatchFiles[vinyl.path]){
            combineSass(gulp.src(scssWatchFiles[vinyl.path].components));
        }
    }
    combineSass(gulp.src(srcScssPathWithExt).pipe(throughCallback(watchCallback)));

    watchInstance = watch(srcScssPathWithExt, {ignoreInitial: true}, watchCallback)
    return watchInstance;
});
