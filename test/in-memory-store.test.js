'use strict';

const testCase  = require('nodeunit').testCase;

const InMemoryStore = require('../src/in-memory-store');

module.exports = testCase({
    'InMemoryStore - Test increment': function (test) {

        const key   = 'test-1';
        const reset = Date.now() + 1000;
        const rateLimitStore = new InMemoryStore();

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
    'InMemoryStore - Test increment expiration': function (test) {

        const key   = 'test-2';
        const reset = Date.now() + 1000;
        const rateLimitStore = new InMemoryStore();

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