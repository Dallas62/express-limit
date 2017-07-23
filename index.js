
const RateLimiter = require('./src/rate-limiter');
const RateLimitStore = require('./src/rate-limit-store');

module.exports = {
    RateLimiter,
    RateLimitStore,
    limit: function(options) {
        "use strict";

        return new RateLimiter(options).middleware;
    }
};
