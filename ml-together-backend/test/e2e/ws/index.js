'use strict';

const { Client }  = require('@hapi/nes');


const run = async () => {

    const nesClient = new Client(`ws://localhost:3000`);
    await nesClient.connect();

    nesClient.subscribe(`/models/5ecbf5704a293f02365a1deb`, (update, flags) => {

        console.log(update);

    });

};

run();
