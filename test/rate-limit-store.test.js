'use strict';

let testCase  = require('nodeunit').testCase;

let RateLimitStore = require('../src/rate-limit-store');

module.exports = testCase({
    'RateLimitStore - Test InMemory increment': function (test) {

        const key   = 'test';
        const reset = Date.now() + 1000;
        const rateLimitStore = new RateLimitStore();

        rateLimitStore.incrementLimit(key, reset, (limits) => {

            test.equal(limits.current, 1);
            test.equal(limits.reset,   reset);

            rateLimitStore.incrementLimit(key, reset, (limits) => {
                test.equal(limits.current, 2);
                test.equal(limits.reset,   reset);

                test.done();
            });
        });
    },
    'RateLimitStore - Test InMemory increment expiration': function (test) {

        const key   = 'test';
        const reset = Date.now() + 1000;
        const rateLimitStore = new RateLimitStore();

        rateLimitStore.incrementLimit(key, reset, (limits) => {

            test.equal(limits.current, 1);
            test.equal(limits.reset,   reset);

            rateLimitStore.incrementLimit(key, reset, (limits) => {
                test.equal(limits.current, 2);
                test.equal(limits.reset,   reset);

                setTimeout(() => {
                    rateLimitStore.incrementLimit(key, reset + 1000, (limits) => {
                        test.equal(limits.current, 1);
                        test.equal(limits.reset,   reset + 1000);

                        test.done();
                    });
                }, 1500);
            });
        });
    }
});