const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

let publicFolder = 'public/js/components'
let resourcesFolder = 'resources/js/components'

let files = fs.readdirSync(resourcesFolder);

function outputManifest(options){
    let filename = options.filename || 'manifest.json'
    let outputPath = options.outputPath || null
    return {
        name: "rollup-plugin-output-manifest",
        generateBundle: async (options, bundle) => {
            let outputBundlePath = options.file
            outputPath = outputPath || path.dirname(outputBundlePath)
            let outputBundleFullPath = path.resolve(outputBundlePath)
            let outputBundleFilename = path.basename(outputBundlePath)
            let outputBundleData = bundle[outputBundleFilename]
            let outputBundleHash = crypto.createHash('md5').update(outputBundleData.code).digest("hex")

            let manifestPath = path.join(outputPath, filename)

            let manifestFile = fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath, 'utf-8')):{}

            let publicOutputFullPath = outputBundleFullPath.replace(outputPath, '')

            manifestFile[publicOutputFullPath] = publicOutputFullPath+'?id='+outputBundleHash

            fs.writeFileSync(manifestPath, JSON.stringify(manifestFile, null, 2))
            console.log('outputPath',outputPath)
        }
    };
}

export default [
    ...files.filter((name, index)=>{
        return fs.lstatSync(resourcesFolder+'/'+name).isDirectory();
    }).map((name)=>{
        return {
            input: resourcesFolder+'/'+name+'/index.js',
            output: {
                format: 'cjs',
                file: publicFolder+'/'+name+'.js',
            },
            plugins: [
                resolve({ browser: true }),
                commonjs(),
                terser(),
                outputManifest({
                    filename: 'mix-manifest.json',
                })
            ]
        }
    })
]
