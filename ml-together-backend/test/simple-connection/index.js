'use strict';

const Nes = require('nes');

var client = new Nes.Client('ws://localhost:3000');

// Main
const main = async () => {
    await client.connect();
    await client.disconnect();
};

main();