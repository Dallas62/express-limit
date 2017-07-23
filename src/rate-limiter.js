
const Store = require('./rate-limit-store');


class RateLimiter {
    constructor({
        max        = 60,        // Maximum of 60
        period     = 60 * 1000, // For a period of 60 seconds
        prefix     = 'rate-limit-',
        status     = 429,
        message    = 'Too many requests',
        identifier = request => {
            return request.ip || request.ips ||          // Read from Default properties
                   request.headers['x-forwarded-for'] || // Read from Headers
                   request.connection.remoteAddress;     // Read from Connection / Socket
        },
        headers = { // Default headers value
            remaining: 'X-RateLimit-Remaining',
            reset:     'X-RateLimit-Reset',
            limit:     'X-RateLimit-Limit'
        },
        store   = new Store() // Default storage in-memory
    } = {}) {

        this._max        = max;
        this._period     = period;
        this._prefix     = prefix;
        this._identifier = identifier;
        this._status     = status;
        this._message    = message;
        this._headers    = headers;
        this._store      = store;

        if(this._max <= 0) {
            throw new Error('The maximum value must be greater than 0.');
        }

        if(this._period <= 0) {
            throw new Error('The period value must be greater than 0.');
        }

        if('function' !== typeof this._store.incrementLimit) {
            throw new Error('Store should have a ".incrementLimit()" method.');
        }
    }

    get middleware() {
        return (req, res, next) => {
            let identifier = this._identifier;

            if('function' === typeof this._identifier) {
                identifier = this._identifier(req);
            }

            const now = Date.now();
            const key = this._prefix + req.url + '-' + identifier;

            this._store.incrementLimit(key, now + this._period, ({
                current = 1,
                reset   = now + this._period
            } = {}) => {

                // Max limit reached
                if(current > this._max) {
                    const err = new Error(this._message);
                    err.status = this._status;
                    return next(err);
                }

                res.header(this._headers.remaining, Math.floor(this._max - current));
                res.header(this._headers.limit,     this._max);
                res.header(this._headers.reset,     reset);

                next();
            });
        };
    }
}


module.exports = RateLimiter;
