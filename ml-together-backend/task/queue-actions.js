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

const pushResultsToQueue = function () {

    // TODO: Place results to the queue
    return new Promise((resolve) => {

        setTimeout(() => {

            resolve();
        }, 1000);
    });
};

module.exports = {
    fetchFromQueue,
    pushResultsToQueue
};
