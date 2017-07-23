# express-limit [![Build Status](https://travis-ci.org/Dallas62/express-limit.svg?branch=master)](https://travis-ci.org/Dallas62/express-limit)

*express-limit* is a small project that add rate limitations to your API.

## Installation

```
npm install --save express-limit
```

## Usage

```
const limit = require('express-limit').limit;

app.get('/api/users', limit({
    max:    5,        // 5 requests
    period: 60 * 1000 // per minute (60 seconds)
}), function(req, res) {
    res.status(200).json({});
});

```
 
 
 ## Options
 
 ```
 {
     max        = 60,                  // Maximum request per period
     period     = 60 * 1000,           // Period in milliseconds
     prefix     = 'rate-limit-',       // Prefix of the key
     status     = 429,                 // Status code in case of rate limit reached
     message    = 'Too many requests', // Message in case of rate limit reached
     identifier = request => {         // The identifier function/value of the key (IP by default, could be "req.user.id")
         return request.ip || request.ips ||          // Read from Default properties
                request.headers['x-forwarded-for'] || // Read from Headers
                request.connection.remoteAddress;     // Read from Connection / Socket
     },
     headers = {                       // Headers names
         remaining: 'X-RateLimit-Remaining',
         reset:     'X-RateLimit-Reset',
         limit:     'X-RateLimit-Limit'
     },
     store = new Store()               // The storage, default storage: in-memory
 }
 ```
 
 ## Custom Store
 
 If you want to implement a special store like Redis or MongoDB, you can use a custom Store.
 To help you, you can take a look to this example to create your own.
 
 ```
 const RateLimitStore = require('express-limit').RateLimitStore;
 const RateLimiter = require('express-limit').RateLimiter;
 
 
class InMemory {

    constructor() {
        this._storage = {};
    }

    increment(key, reset, callback) {
        if('function' !== typeof callback) {
            return;
        }

        if(
            !this._storage[key] ||
             this._storage[key].reset <= Date.now()
        ) {

            this._storage[key] = {
                current: 0,
                reset:   reset
            };
        }

        this._storage[key].current++;

        callback(this._storage[key]);
    }
}

const MyStore = new RateLimitStore(new InMemory());
const limit = function(options = {}) {
    
    options.store = new MyStore();
    
    return new RateLimiter(options).middleware;
};
 
 ```
 
 Concrete sample using redis will be added soon.
 

[Keep in touch!](https://twitter.com/BorisTacyniak)
