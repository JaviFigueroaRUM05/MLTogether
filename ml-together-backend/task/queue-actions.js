'use strict';

const fetchFromQueue = function (channel, queue, maxTimeToWait) {

    return new Promise((resolve) => {

        setTimeout( () => {

            resolve(null);
        }, maxTimeToWait);

        channel.consume(queue, (msg) => {

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
