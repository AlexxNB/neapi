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

### API Scheme
Then we should create scheme of the API methods. Methods are groups by namespaces. 

```js
// api/scheme.js
module.exports = {
    // algebra -  a namespace for group of methods
    algebra: {
        // a list of the methods
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

### Methods

Method is a function that accepts 4 parameters:

* `resp(payload)` - a function, that sends any data (or `payload`) to the client
* `err(error,payload)` - a function, that sends error to the client: `error` - code or text of the error, `payload` - any additional data.
* `params` - object of data recieved from client.
* `context` - special object for context managing (see below) 

Every method must return  either `resp()` or `err()` call.

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

### Request

The `client.request(namespace,method,params,context)` is a *async* function that accept 4 parameters and returns responce object:
* `namespace` - defines the namespace of the method
* `method` - the method, we calling on the API-server 
* `params` - object with any neccesary data 
* `context` - simple object, any data you wanna put to the context (see below)

### Responce object
Responce object is method's return value. It is simple object with two properties:
* `error` - null if no error, text or code if error was sent by method
* `payload` - any data sent from method.

## Lifecycle Hooks

NeAPI is request-responce type API. Other words, client sends request with some parameters to API-server and wait for responce. There are 4 lifecycle hooks on this way:
* `onRequest` - client, call right before data will send to the server
* `onRecieve` - server, call when data coming to the server, but before any method will fired
* `onSend` - server, call right after method's work before data will be sent to the client
* `onResponce` - client, call when data from client recieved

All hooks functions have two parameters:
* `packet` - raw object with data transmited in request-responce chain
* `context` - special object for context managing (see below) 

On client, `onRequest` and `onResponce` hooks can be defined in config during client object initialization:

```js
// Client
import neapi from 'neapi/client';

const api = neapi.client({
    endpoint: '/api',
    onRequest: (packet,context) => console.log('Request:', packet),
    onResponce: (packet,context) => console.log('Responce:', packet),
});
```

On server, `onRecieve` and `onSend` should be defined in middleware's initialization config:

```js
const neapi = require('neapi/server');

const neapi_middleware = neapi.getMiddleware({
  scheme:api_scheme,
  onRecieve: (packet,context) => console.log('Recieve:', packet),
  onSend: (packet,context) => console.log('Send:', packet)
});
```

## Context Usage

Context is additional storage for any data that will be accesible during whole request-responce chain. You can set some context's data on request initialization, add some data in every hooks, and get whole context's data in responce on the client.

Usualy context may be used for users authentication.

Let's look the stages where context may be accesible:

**Client:**

1. `client.request(namespace,method,params,context)` - it is first initialization of the `context`. It can be any object like `{token: "1a2b3c4e5f6d7e"}`. It is not necessary to initialize the context on the request, just ommit context parameter in the function.

2. `onRequest(packet,context)` - there and all next stages `context` is special _context function_, that allows to get context values at current stage or set any additional data.

**Server:**

3. `onRecieve(packet,context)`

4. `method(resp, err, params, context)` - context is accesible in every called method

5. `onSend(packet,context)`

**Client:**

6. `onResponce(packet,context)`


_Context function_ on 2-6 stages can be used on these ways:
* `context()` - return whole context object
* `context(name)` - return value of the context's property with defined name
* `context({...})` - merge new object with context object
* `context(name,value)` - add or modify context's property with specified name and set the value
