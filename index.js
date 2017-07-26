
const RateLimiter = require('./src/rate-limiter');
const InMemoryStore = require('./src/in-memory-store');
const RedisStore = require('./src/redis-store');

module.exports = {
    RateLimiter,
    InMemoryStore,
    RedisStore,
    limit: function(options) {
        "use strict";

        return new RateLimiter(options).middleware;
    }
};
