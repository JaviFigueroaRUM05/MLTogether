'use strict';

const Schmervice = require('schmervice');
const Webpack = require('webpack');
const Util = require('util');
const FS = require('fs');
const Path = require('path');
const EJS = require('ejs');

//promisify
const mkdir = Util.promisify(FS.mkdir);
const writeFile = Util.promisify(FS.writeFile);

class ScriptGeneratorService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);

        this.templatesPath = this.options.templatesPath ||
            '/lib/plugins/worker-script-generator/templates';

        this.publicPath = this.options.publicPath || 'public';
        this.temporaryPath = this.options.temporaryPath ||
            'lib/plugins/worker-script-generator/temporary';
    }

    async initialize() {

        try {
            await mkdir(`${this.publicPath}/scripts`, { recursive: true });
            await mkdir(`${this.temporaryPath}`, { recursive: true });
        }
        catch (err) {
            console.error(err);
            throw err;
        }


    }

    async generateScript(projectId, mapFnString, reduceFnString, dataUrl) {

        const host = this.server.info.uri;
        // copy template file into the public/projectId folder

        // Turn mapFn and reduceFn into a file

        // Run webpack for the final bundle
        /**
         * The API only supports a single concurrent compilation at a time.
         * When using run, wait for it to finish before calling run or watch
         * again. When using watch, call close and wait for it to finish before
         * calling run or watch again. Concurrent compilations will corrupt the
         * output files.
         */
        const model = {
            mapFn: mapFnString,
            reduceFn: reduceFnString,
            dataUrl,
            projectId,
            mlTogetherHost: host
        };
        // TODO: Fix template so the script does not go crazy not completing tasks

        try {
            //render ejs template to html string
            const worker = await EJS
                .renderFile(`${this.templatesPath}/worker.ejs`, model)
                .then((output) => output);

            //create file and write html
            await writeFile(`/worker-${projectId}.js`, worker, 'utf8');


            Webpack({
                entry: `${this.publicPath}/scripts/worker-${projectId}.js`,
                output: {
                    filename: `main-${projectId}.js`,
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
    }

}

module.exports = ScriptGeneratorService;
