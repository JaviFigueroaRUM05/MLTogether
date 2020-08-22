'use strict';

const Schmervice = require('schmervice');
const Webpack = require('webpack');
const Util = require('util');
const FS = require('fs');
const FSPromise = require('fs').promises;
const Path = require('path');
const EJS = require('ejs');
const Bundler = require('parcel-bundler');


//promisify
const mkdir = Util.promisify(FS.mkdir);
const writeFile = Util.promisify(FS.writeFile);

class ScriptGeneratorService extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);

        if (!this.options.publicPath) {
            throw new Error('Missing options.publicPath for ScriptGeneratorService registration');
        }

        if (!this.options.temporaryPath) {
            throw new Error('Missing options.temporaryPath for ScriptGeneratorService registration');
        }

        this.templatesPath = this.options.templatesPath ||
            Path.join(__dirname, '../templates');

        this.publicPath = this.options.publicPath;
        this.temporaryPath = this.options.temporaryPath;

        this.ejsPrefix = this.options.ejsPrefix || 'worker';
        this.webpackPrefix = this.options.webpackPrefix || 'main';

        this.doBundle = this.options.doBundle || true;

        this.wsURL  = this.options.wsURL || `${this.server.info.host}:${this.server.info.port}`;
    }

    async initialize() {

        try {
            await mkdir(`${this.publicPath}`, { recursive: true });
            await mkdir(`${this.temporaryPath}`, { recursive: true });
        }
        catch (err) {
            console.error(err);
            throw err;
        }


    }


    async initializeProject(projectId) {

        try {
            await mkdir(`${this.publicPath}/${projectId}`, { recursive: true });
        }
        catch (err) {
            console.error(err);
            throw err;
        }


    }

    async generateIndexHTML(projectId) {

        const ejsOutputDir = `${this.publicPath}/${projectId}/index.html`;

        try {

            //render ejs template to html string
            const filename = '';
            const worker = await EJS
                .renderFile(`${this.templatesPath}/index.ejs`, { filename })
                .then((output) => output);


            //create file and write html
            await writeFile(ejsOutputDir, worker, 'utf8');
            return Path.resolve(__dirname, ejsOutputDir);

        }
        catch (error) {
            console.error(error);
        }
    }


    async generateWorkerScript(projectId, mapFnString, reduceFnString, dataUrl) {

        const host = this.wsURL;
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
        // TODO: Check if the Webpack runner explodes when two things are happening
        const ejsOutputDir = `${this.temporaryPath}/${this.ejsPrefix}-${projectId}.js`;
        const webpackOutputFilename = `${this.webpackPrefix}.js`;

        try {
            //render ejs template to html string
            const worker = await EJS
                .renderFile(`${this.templatesPath}/worker.ejs`, model)
                .then((output) => output);


            //create file and write html
            await writeFile(ejsOutputDir, worker, 'utf8');
            // Bundler options
            const options = {
                outDir: `${this.publicPath}/${projectId}`, // The out directory to put the build files in, defaults to dist
                outFile: webpackOutputFilename, // The name of the outputFile
                watch: false, // Whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
                cache: false, // Enabled or disables caching, defaults to true
                cacheDir: '.cache', // The directory cache gets put in, defaults to .cache
                contentHash: false, // Disable content hash from being included on the filename
                minify: this.doBundle, // Minify files, enabled if process.env.NODE_ENV === 'production'
                //bundleNodeModules: false, // By default, package.json dependencies are not included when using 'node' or 'electron' with 'target' option above. Set to true to adds them to the bundle, false by default
                logLevel: 3, // 5 = save everything to a file, 4 = like 3, but with timestamps and additionally log http requests to dev server, 3 = log info, warnings & errors, 2 = log warnings & errors, 1 = log errors, 0 = log nothing
                hmr: false, // Enable or disable HMR while watching
                sourceMaps: true // Enable or disable sourcemaps, defaults to enabled (minified builds currently always create sourcemaps)
            };

            const bundler = new Bundler(ejsOutputDir, options);
            const bundle = await bundler.bundle();

            // FS.rmdirSync(ejsOutputDir, { recursive: true });


            return Path.resolve(`${this.publicPath}/${projectId}`, webpackOutputFilename);

        }
        catch (error) {
            console.error(error);
        }

    }

}

module.exports = ScriptGeneratorService;
