'use strict';

const Glue = require('@hapi/glue');
const Manifest = require('./manifest');

exports.deployment = async (start) => {

    const manifest = Manifest.get('/');
    const server = await Glue.compose(manifest, { relativeTo: __dirname });

    await server.initialize();

    if (!start) {
        return server;
    }

    await server.start();

    console.log(`Server started at ${server.info.uri}`);

    return server;
};

if (!module.parent) {

    let server = null;
    exports.deployment(true).then( (ser) => {

        server = ser;
    });

    process.on('unhandledRejection', (err) => {

        throw err;
    });
    process.on('SIGINT', () => {

        console.log('stopping hapi server');
        server.stop({ timeout: 10000 }).then((err) => {

            console.log('hapi server stopped');
            process.exit((err) ? 1 : 0);
        });
    });
}
