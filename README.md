# NeAPI
Very simple JSON-based request-responce API. Useful in simple all-in-one web-applications with Node.js as a backend.

## Server Usage

Server part of the NeAPI is a middleware for Express-like http-servers. For example we can use Polka server:

```js
// server.js
const polka = require('polka');
const neapi = require('neapi/server');

const scheme = require('./api/scheme')
const neapi_middleware = neapi.getMiddleware({scheme});

polka()
  .use('/api',neapi_middleware)
  .listen(3000, err => {
    if (err) throw err;
  });
```

Then we should create scheme of the API methods. Methods are groups by namespaces. 

```js
// api/scheme.js
module.exports = {
    // algebra - is a namespace for group of methods
    algebra: {
        // there are a list of the methods
        addition: (resp, err, params, context) => {
            if(params.a > 100 ) return err('Too big param');
            return resp( params.a + params.b )
        },
        subtraction: (resp, err, params, context) => {
            ...
        }
    },
    auth: {
        ...
    },
    ...   
}
```

## Client Usage

```js
import neapi from 'neapi/client';

const api = neapi.client({endpoint: '/api'});

...

const a = 7;
const b = 5;

const responce = await api.request('algebra','addition',{a,b});

if(responce.error)
    alert("We have an error: " + responce.error);
else
    alert("The sum is equal " + responce.payload);
```

## Lifecycle Hooks

TODO

## Context Usage

TODO

## Refernce

TODO