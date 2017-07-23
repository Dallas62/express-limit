'use strict';

const testCase  = require('nodeunit').testCase;

const RateLimiter = require('../src/rate-limiter');

const express = require('express');
const request = require('supertest');

const app = express();

const rateLimiter = new RateLimiter({
    max:    5,
    period: 1000
});

app.get('/test', rateLimiter.middleware, function(req, res) {
    res.status(200).json({ test: 'OK' });
});

module.exports = testCase({
    'RateLimiter - Test limits OK': function (test) {

        let counter = 0;

        for(let i = 1; i <= 5; i++) {
            request(app)
                .get('/test')
                .expect('Content-Type', /json/)
                .expect('X-RateLimit-Remaining', String(Math.floor(5 - i)))
                .expect('X-RateLimit-Limit',     String(5))
                .expect(200)
                .then(response => {
                    test.equal(response.body.test, 'OK');
                    counter++;

                    if(5 === counter) {
                        test.done();
                    }
                });
        }
    },
    'RateLimiter - Test limits KO': function (test) {
        request(app)
            .get('/test')
            .expect(429, () => test.done());
    },
    'RateLimiter - Key name': function (test) {
        test.equal(typeof rateLimiter._store._store._storage['rate-limit-/test-::ffff:127.0.0.1'], 'object');

        test.done();
    }
});