'use strict';

const Glue = require('@hapi/glue');
const Manifest = require('./manifest');
const Nodemon = require('nodemon');

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

        console.error(err);
        process.exit(1);
    });
    process
        .on('SIGINT', async () => {

            console.log('stopping hapi server');
            await server.mongo.client.close();
            server.stop({ timeout: 10000 }).then((err) => {

                console.log('hapi server stopped');
                process.exit((err) ? 1 : 0);
            });
        })
        .on('SIGHUP', async () => {

            console.log('stopping hapi server');
            await server.mongo.client.close();
            server.stop({ timeout: 10000 }).then((err) => {

                console.log('hapi server stopped');
                process.exit((err) ? 1 : 0);
            });
        })
        .on('SIGUSR2', () => {

            server.stop({ timeout: 10000 }).then((err) => {

                console.log('hapi server stopped');
                process.kill(process.pid, 'SIGUSR2');
            });
        });
}
