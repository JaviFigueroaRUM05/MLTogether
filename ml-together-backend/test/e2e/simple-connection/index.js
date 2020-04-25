'use strict';

const Nes = require('nes');

const client = new Nes.Client('ws://localhost:3000');

// Main
const main = async () => {

    await client.connect();
    await client.disconnect();
};

main();