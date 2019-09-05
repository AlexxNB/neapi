const polka = require('polka');
const sirv = require('sirv');
const neapi = require('./../../server');

const static_server_middleware = sirv('client',{
  dev: (process.argv[2] === '--dev')
});

const api_scheme = require('./api/scheme')
const neapi_middleware = neapi.getMiddleware({
  scheme:api_scheme,
  onRecieve: (packet,context) => {
    
  },
  onSend: (packet,context) => {
    
  }
});

polka()
  .use('/api',neapi_middleware)
  .use(static_server_middleware)
  .listen(3000, err => {
    if (err) throw err;
    console.log(`> API Server ready. Open example client on http://localhost:3000`);
  });