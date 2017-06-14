'use strict'

const Q = require('q');
const _ = require('lodash');
const config = require('../config/environment');

const jackrabbit = require('jackrabbit');

exports.exchanges = {};

exports.setupConsumer = function() {
    let rabbit = exports.rabbit;

    _.forEach(_.keys(exports.exchanges), function(name) {
        let queue = exports.exchanges[name].queue;
        let worker = exports.exchanges[name].worker;

        queue.consume(worker.perform, {
            // noAck: true
        });
    });
};

if (config.env === 'test') {
    exports.rabbit = {};
} else {
    exports.rabbit = jackrabbit(config.rabbit_url);
}

const queues = [{
    name: 'warning.worker',
    worker: require('../workers/warning/worker'),
    messageTTL: 60 * 60 * 1000
}, {
    name: 'notification.worker',
    worker: require('../workers/notification/worker'),
    messageTTL: 10 * 60 * 1000
}];

// Setup queues
_.forEach(queues, function(queue) {
    if (config.env === 'test') {
        exports.exchanges[queue.name] = {
            worker: queue.worker
        };
    } else {
        let exchange = exports.rabbit.direct(queue.name);

        let queueOptions = {
            key: queue.name,
            exclusive: true
        };

        if (queue.messageTTL) {
            queueOptions.messageTtl = queue.messageTTL;
        }

        let rabbitQueue = exchange.queue(queueOptions);

        exports.exchanges[queue.name] = {
            exchange: exchange,
            queue: rabbitQueue,
            worker: queue.worker
        };
    }
});


exports.send = function(queue, data) {
    if (config.logRabbit) {
        console.log('send to queue: ' + queue);
        console.log(data);
    }

    if (config.env === 'test') {
        let deferred = Q.defer();

        // Perform the method on the worker imediately
        exports.exchanges[queue].worker.perform(data, function() {
            deferred.resolve(true);
        });

        return deferred.promise;
    }

    try {
        let exchange = exports.exchanges[queue].exchange;

        exchange.publish(data, {
            key: queue
        });

        return Q.when(true);
    } catch (error) {
        console.log(error);
        return Q.when(false);
    }
};
