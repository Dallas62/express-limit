import RateLimiter from './rate-limiter';
import InMemoryStore from './in-memory-store';
import RedisStore from './redis-store';
import RedisLegacyStore from './redis-legacy-store';

export = {
  RateLimiter,
  InMemoryStore,
  RedisStore,
  RedisLegacyStore,
  limit: function (options) {
    return new RateLimiter(options).middleware;
  },
};
