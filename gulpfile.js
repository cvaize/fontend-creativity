const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const _ = require('lodash');
const {terser} = require('rollup-plugin-terser');
const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');
const magicImporter = require('node-sass-magic-importer');
const using = require('gulp-using');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const minifyCss = require('gulp-clean-css');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const watchInclude = require('./gulp-watch-include');
const manifest = require('./gulp-manifest');
const browserSync = require('browser-sync').create();
sass.compiler = require('node-sass');

let srcScssPath = path.resolve('./resources/sass/components/**/*.scss');
let destCssPath = path.resolve('./public/css/components/');
let srcJsPath = path.resolve('./resources/js/components/*.js');
let destJsPath = path.resolve('./public/js/components/');

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
            path: 'mix-manifest.json',
            publicPath: './public'
}))
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
            path: 'mix-manifest.json',
            publicPath: './public'
        }))
}

gulp.task('js', function () {
    return combineJs(gulp.src(srcJsPath));
});

gulp.task('sass', function () {
    return combineSass(gulp.src(srcScssPath));
});


gulp.task('sass:watch', function () {
    return watchInclude({
        output: (pipe)=>{
            combineSass(pipe)
        },
        getIncludePaths: (filepath, cb)=>{
            // filepath - путь к файлу у, которого нужно узнать зависимости
            if(filepath.includes('.scss')){
                sass.compiler.render({
                    file: filepath,
                    importer: magicImporter(),
                    includePaths: ['node_modules'],
                }, function(err, result) {
                    cb(result.stats.includedFiles.filter(includedFile => !includedFile.includes('node_modules') && !includedFile.includes(filepath)))
                })
            }else{
                cb([])
            }
        },
        watchPaths: [srcScssPath]
    });
});

gulp.task('sass:js:watch', function () {
    return watchInclude({
        output: (pipe)=>{
            combineSass(pipe)
        },
        getIncludePaths: (filepath, cb)=>{
            // filepath - путь к файлу у, которого нужно узнать зависимости
            if(filepath.includes('.scss')){
                sass.compiler.render({
                    file: filepath,
                    importer: magicImporter(),
                    includePaths: ['node_modules'],
                }, function(err, result) {
                    cb(result.stats.includedFiles.filter(includedFile => !includedFile.includes('node_modules') && !includedFile.includes(filepath)))
                })
            }else{
                cb([])
            }
        },
        watchPaths: [srcScssPath]
    });
});
