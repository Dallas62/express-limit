'use strict';

const testCase  = require('nodeunit').testCase;

// Initialize Redis
const redis = require('redis');
const client = redis.createClient();

const RedisStore = require('../src/redis-store');

module.exports = testCase({
    'RedisStore - Test increment': function (test) {

        const key   = 'test-1';
        const reset = Date.now() + 1000;
        const rateLimitStore = new RedisStore(client);

        rateLimitStore.increment(key, reset, (limits) => {

            test.equal(limits.current, 1);
            test.equal(limits.reset,   reset);

            rateLimitStore.increment(key, reset, (limits) => {
                test.equal(limits.current, 2);
                test.equal(limits.reset,   reset);

                test.done();
            });
        });
    },
    'RedisStore - Test increment expiration': function (test) {

        const key   = 'test-2';
        const reset = Date.now() + 1000;
        const rateLimitStore = new RedisStore(client);

        rateLimitStore.increment(key, reset, (limits) => {

            test.equal(limits.current, 1);
            test.equal(limits.reset,   reset);

            rateLimitStore.increment(key, reset, (limits) => {
                test.equal(limits.current, 2);
                test.equal(limits.reset,   reset);

                setTimeout(() => {
                    rateLimitStore.increment(key, reset + 1000, (limits) => {
                        test.equal(limits.current, 1);
                        test.equal(limits.reset,   reset + 1000);

                        test.done();
                    });
                }, 1500);
            });
        });
    }
});