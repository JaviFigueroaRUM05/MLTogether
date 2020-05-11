'use strict';

//imports
const Util = require('util');
const FS = require('fs');
const Path = require('path');
const EJS = require('ejs');
const Webpack = require('webpack');
const MapFn = require('./templates/map');
const ReduceFn = require('./templates/reduce');

//promisify
const mkdir = Util.promisify(FS.mkdir);
const writeFile = Util.promisify(FS.writeFile);


const render = async function render() {

    const model = {
        mapFn: MapFn,
        reduceFn: ReduceFn,
        dataUrl: 'http://localhost:3000/mnist/data',
        projectId: 'mnist121',
        modelHost: 'http://localhost:3000/projects/mnist121/ir',
        mlTogetherHost: 'localhost:3000'
    };
    // TODO: Fix template so the script does not go crazy not completing tasks

    try {
        //create output directory
        await mkdir('dist', { recursive: true });

        //render ejs template to html string
        const worker = await EJS
            .renderFile('./templates/worker.ejs', model)
            .then((output) => output);

        //create file and write html
        await writeFile('dist/worker.js', worker, 'utf8');


        Webpack({
            entry: './dist/worker.js',
            output: {
                filename: 'main.js',
                path: Path.resolve(__dirname, 'dist')
            }
        }, (err, stats) => {
            // Stats Object
            if (err || stats.hasErrors()) {
                // Handlep errors here
                const info = stats.toJson();

                if (stats.hasErrors()) {
                    console.error(info.errors);
                }

                if (stats.hasWarnings()) {
                    console.warn(info.warnings);
                }
            }
            // Done processing
        });
    }
    catch (error) {
        console.log(error);
    }
};

render();
