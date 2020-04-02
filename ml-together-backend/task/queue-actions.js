'use strict';

const fetchFromQueue = function (channel, queue) {

    return new Promise((resolve) => {

        channel.consume(queue, (msg) => {

            console.log(' [x] Received %s', msg.content.toString());
            resolve(msg.content);
        }, {
            noAck: false
        });

    });
};

const pushResultsToQueue = function (results,channel,queue) {

    return new Promise((resolve) => {

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(results)), {
            persistent: true
        });
        resolve();
    });
};

module.exports = {
    fetchFromQueue,
    pushResultsToQueue
};
