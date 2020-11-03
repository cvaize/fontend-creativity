'use strict';
const gulp = require('gulp');
const watch = require('gulp-watch');
const through = require('through2');
const minimatch = require("minimatch");
const _ = require('lodash');

const throughCallback = (callback) => {
    return through.obj((file, enc, cb) => {
        callback(file, 'init');
        cb();
    });
};



/**
 *
 * @param getIncludePaths(filepath, cb): void
 * @param watchPaths: []
 * @param output(): void
 */
const plugin = ({getIncludePaths, watchPaths, output}) => {
    const graph = {}; // path : [includePath, includePath, includePath],
    const watched = {};
    let watchInstance

    let checkInWatchPaths = (path) => {
        let exist = false; // Нет в путях отправленных для обработки и отслеживания
        for (let i = 0; i < watchPaths.length; i++) {
            let watchPath = watchPaths[i]
            if(minimatch(path, watchPath)){
                exist = true;
                break;
            }
        }
        return exist
    }

    let unwatch = (path)=>{
        if(path && graph[path] && !graph[path].length && !checkInWatchPaths(path) && watched[path]){
            watched[path] = undefined;
            watchInstance.unwatch(path)
        }
    }

    let add = (path, isNoAddToInstance)=>{
        if(path && !watched[path]){
            watched[path] = true;
            !isNoAddToInstance && watchInstance.add(path)
        }
    }

    let worker = (file, type) => {
        if (!file || file.type === 'deleted' || file.event === 'unlink') {
            if(file.history[0]){
                unwatch(file.history[0])
            }
            return true
        }
        let currentPath = file.path
        if(!currentPath){
            return true;
        }
        add(currentPath, type === 'init')
        unwatch(currentPath)

        if(checkInWatchPaths(currentPath)){

            // Тут нужна рекурсия для погружения в зависимости
            getIncludePaths(currentPath, (includePaths)=>{
                let unwatchPaths = _.difference(graph, includePaths); // Файлы, которые нужно исключить из связей текущего файла, а текущий файл из их связей этих файлов

                graph[currentPath] = includePaths; // Применил текущие связи для текущего файла

                for (let i = 0; i < includePaths.length; i++) {
                    let includePath = includePaths[i];
                    if(!includePath){
                        continue;
                    }
                    if(!graph[includePath]){
                        graph[includePath] = []
                    }
                    if(!graph[includePath].includes(currentPath)){
                        graph[includePath].push(currentPath)
                    }
                    add(includePath)
                }

                // Исключаю текущий файл из связи других файлов
                for (let i = 0; i < unwatchPaths.length; i++) {
                    let unwatchPath = unwatchPaths[i];
                    if(!unwatchPath){
                        continue;
                    }
                    if(graph[unwatchPath]){
                        _.pull(graph[unwatchPath], currentPath)
                    }
                    unwatch(unwatchPath)
                }
                if(graph[currentPath]){
                    for (let i = 0; i < graph[currentPath].length; i++) {
                        let graphPath = graph[currentPath][i]
                        if(checkInWatchPaths(graphPath)){
                            output(gulp.src(graphPath))
                        }
                    }
                }
            })

            output(gulp.src(currentPath))
        }else{
            if(graph[currentPath]){
                for (let i = 0; i < graph[currentPath].length; i++) {
                    let graphPath = graph[currentPath][i]
                    if(checkInWatchPaths(graphPath)){
                        output(gulp.src(graphPath))
                    }
                }
            }
        }
    }

    watchInstance = watch(watchPaths, {ignoreInitial: true}, worker)
    output(gulp.src(watchPaths).pipe(throughCallback(worker)))
    return watchInstance;
};

module.exports = plugin;
