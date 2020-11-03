const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const Case = require('case')

let resourcesFolder = 'resources/js/components'

const watcher = chokidar.watch(resourcesFolder, {ignored: /^\./, persistent: true});

let components = [];

let rollup;
let offInit = false;

function writeNames(){
    components.forEach((name)=>{
        fs.writeFileSync(resourcesFolder+'/'+name+'/name.js', `export default '${Case.camel('appComponent_'+name)}';`);
    })
}

function init(){
    if(offInit){
        return;
    }
    if(components.length === 0){
        offInit = true;
        setTimeout(()=>{offInit = false;}, 5000);
    }

    let files = fs.readdirSync(resourcesFolder);
    let newComponents = files.filter((name, index)=>{
        return fs.lstatSync(resourcesFolder+'/'+name).isDirectory();
    });
    let reloadRollup = components.length !== newComponents.length;

    if(!reloadRollup){
        for (let i = 0; i < newComponents.length; i++) {
            if(newComponents[i] !== components[i]){
                reloadRollup = true;
                break;
            }
        }
    }

    if(reloadRollup){
        components = newComponents;

        if(rollup){
            rollup.kill('SIGHUP');
        }

        writeNames()

        const { spawn } = require("child_process");

        console.log('Rollup start')

        rollup = spawn("rollup", ["-c", path.join(__dirname, 'rollup.config.js'), '-w']);

        rollup.stdout.on("data", data => {
            console.log(`stdout: ${data}`);
        });

        rollup.stderr.on("data", data => {
            console.log(`stderr: ${data}`);
        });

        rollup.on('error', console.log);

        rollup.on("close", function (){
            console.log('Rollup stopped')
        });

    }
}


watcher
    .on('add', function(path) {
        console.log('File', path, 'has been added in watch');
        init();
    })
    .on('unlink', function(path) {
        console.log('File', path, 'has been removed from watch');
        init();
    })
    .on('error', function(error) {console.error('Error happened', error);})
