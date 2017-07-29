'use strict';

const testCase = require('nodeunit').testCase;

const RateLimiter = require('../src/rate-limiter');

const express = require('express');
const request = require('supertest');

const app = express();

const rateLimiter = new RateLimiter({
    max: 5,
    period: 1000
});

let skipLimits = false;
let customLimits = false;

app.get('/test', function (req, res, next) {
    if (true === skipLimits) {
        req._skip_limits = true;
    }

    if (true === customLimits) {
        req._custom_limits = {
            max: 50,
            period: 2000
        };
    }

    next();
}, rateLimiter.middleware, function (req, res) {
    res.status(200).json({test: 'OK'});
});

module.exports = testCase({
    'RateLimiter - Test limits OK': function (test) {

        let counter = 0;

        for (let i = 1; i <= 5; i++) {
            request(app)
                .get('/test')
                .expect('Content-Type', /json/)
                .expect('X-RateLimit-Remaining', String(Math.floor(5 - i)))
                .expect('X-RateLimit-Limit', String(5))
                .expect(200)
                .then(response => {
                    test.equal(response.body.test, 'OK');
                    counter++;

                    if (5 === counter) {
                        test.done();
                    }
                });
        }
    },
    'RateLimiter - Test limits KO': function (test) {
        request(app)
            .get('/test')
            .expect(429, () => {
                setTimeout(function () {
                    test.done();
                }, 1000);
            });
    },
    'RateLimiter - Test skip limits': function (test) {
        skipLimits = true;

        let counter = 0;

        for (let i = 1; i <= 50; i++) {
            request(app)
                .get('/test')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    test.equal(response.body.test, 'OK');

                    counter++;

                    if (50 === counter) {
                        skipLimits = false;

                        test.done();
                    }
                });
        }
    },
    'RateLimiter - Test custom limits OK': function (test) {
        customLimits = true;

        let counter = 0;

        for (let i = 1; i <= 50; i++) {
            request(app)
                .get('/test')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    test.equal(response.body.test, 'OK');

                    counter++;

                    if (50 === counter) {
                        test.done();
                    }
                });
        }
    },
    'RateLimiter - Test custom limits KO': function (test) {
        request(app)
            .get('/test')
            .expect(429, () => {
                customLimits = false;
                
                setTimeout(function () {
                    test.done();
                }, 2000);
            });
    },
    'RateLimiter - Key name': function (test) {
        test.equal(typeof rateLimiter._store._storage['rate-limit-/test-::ffff:127.0.0.1'], 'object');

        test.done();
    }
});