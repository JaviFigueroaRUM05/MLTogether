'use strict';

const Base64ArrayBuffer = require('base64-arraybuffer');


const ab2str = function (buf) {

    const str = Base64ArrayBuffer.encode(buf);
    return str;
};

const str2ab = function (str) {

    const buf = Base64ArrayBuffer.decode(str);
    return buf;

};

module.exports = { ab2str, str2ab };
