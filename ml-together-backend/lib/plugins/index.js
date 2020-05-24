'use strict';

const JWT = require('hapi-auth-jwt2');
const Schmervice = require('schmervice');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');

module.exports.plugins = [
    JWT,
    Schmervice,
    Inert,
    Vision
];
