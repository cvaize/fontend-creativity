const mix = require('laravel-mix');
const fs = require('fs');
const Case = require('case')

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

// mix
//     .js('resources/js/app/index.js', 'public/js/app.js')
//     .sass('resources/sass/app.scss', 'public/css/app.css');

let files = fs.readdirSync('./resources/js/components');
let names = fs.readdirSync('./resources/js/names');
//Создание файлов с названиями
files.forEach(function (file) {
    if (file.indexOf('.js') !== -1) {
        if(names.indexOf(file) === -1){
            let name = Case.camel('appComponent_'+file.replace('.js', ''));
            fs.writeFileSync('./resources/js/names/'+file, `export default '${name}';`);
        }
    }
});
//Удаление старых файлов с названиями
names.forEach(function (name) {
    if (name.indexOf('.js') !== -1) {
        if(files.indexOf(name) === -1){
            fs.unlinkSync('./resources/js/names/'+name);
        }
    }
});
//Обработка JS
files.forEach(function (file) {
    if (file.indexOf('.js') !== -1) {
        mix.js(`resources/js/components/${file}`, `public/js/components/`);
    }
})


//Обработка css
fs.readdirSync('./resources/sass/components').forEach(function (file) {
    if (file.indexOf('.scss') !== -1) {
        mix.sass(`resources/sass/components/${file}`, `public/css/components/`);
    }
})

if (true) {
    mix.version();
}
if (false) {
    let domen = 'example.ru'
    mix.browserSync({
        proxy:  // проксирование вашего удаленного сервера, не важно на чем back-end
            {
                target: `http://${domen}/`,
                ws: true
            },
        logPrefix: domen, // префикс для лога bs, маловажная настройка
        host: domen, // можно использовать ip сервера
        port: 3000, // порт через который будет проксироваться сервер
        // open: 'external', // указываем, что наш url внешний
        notify: false,
        ghost: true,
        // httpModule: 'http2',
        // https: {
        //     key: "./ssl/privkey.pem",
        //     cert: "./ssl/fullchain.pem",
        // },
    });
}
