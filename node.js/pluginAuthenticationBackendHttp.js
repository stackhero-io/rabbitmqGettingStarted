require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ngrok = require('ngrok');

const app = express();
let apiServer;

// Here is an example of an API used to delegate the RabbitMQ users authentication.
// See https://github.com/rabbitmq/rabbitmq-server/
// You need a Ngrok account (ngrok.com) that will create a tunnel from internet to your computer.
// Thanks to Ngrok, a URL like https://xxxx.ngrok.com will be created and will forward requests to this API running locally on your computer.
// Ngrok is required only for this example, in real world your will run the API on a public server like Node.js on Stackhero. See https://www.stackhero.io/en/services/Node-js/benefits

const users = [
  {
    username: 'stackhero',
    password: 'changeMe',
    roles: [ 'management' ]
  }
];

(async () => {
    if (!process.env.NGROK_TOKEN) {
      throw Error('You should first fill the .env-example file and rename it to .env');
    }

    const localPort = 8080;

    // Create a HTTP server
    // CF. https://github.com/rabbitmq/rabbitmq-server/tree/master/deps/rabbitmq_auth_backend_http#what-must-my-web-server-do
    // Other languages are available here: https://github.com/rabbitmq/rabbitmq-server/tree/master/deps/rabbitmq_auth_backend_http/examples
    app
      .use(bodyParser.urlencoded({ extended: false }))

      .post('/user', (req, res) => {
        // Will allow the user to connect with "management" capability.
        // See https://www.rabbitmq.com/management.html#permissions

        const user = users.find(user => req.body.username === user.username && req.body.password === user.password);
        if (!user) {
          res.send('deny');
        }
        else {
          res.send(`allow ${user.roles.join(' ')}`);
        }

        console.log('Received request:', req.method, req.url, JSON.stringify(req.body),
          user
            ? `User allowed with roles ${user.roles.join(' ')}`
            : 'User denied'
        );
      })

      .post('/vhost', (req, res) => {
        console.log('Received request:', req.method, req.url, JSON.stringify(req.body));
        res.send('allow');
        // res.send('deny');
      })

      .post('/resource', (req, res) => {
        console.log('Received request:', req.method, req.url, JSON.stringify(req.body));
        res.send('allow');
        // res.send('deny');
      })

      .post('/topic', (req, res) => {
        console.log('Received request:', req.method, req.url, JSON.stringify(req.body));
        res.send('allow');
        // res.send('deny');
      })

      // Catch undefined route to help debugging
      .use((req, res, next) => {
        console.log('[404] on ', req.method, req.url, req.query, req.params);
        next();
      });
    apiServer = app.listen(localPort, () => console.debug(`👂 API listening locally on ${localPort}`));


    // Create Ngrok tunnel
    await ngrok.kill();
    const ngrokUrl = await ngrok.connect({
      proto: 'http',
      addr: localPort,
      region: 'eu',
      inspect: false,
      authtoken: process.env.NGROK_TOKEN,
      // onStatusChange: status => console.debug('[NGROK] onStatusChange:', status),
      // onLogEvent: data => console.debug('[NGROK] onLogEvent:', data)
    });

    console.log();
    console.log(`🌎 Ngrok is listening on ${ngrokUrl} and redirects requests to this computer on port ${localPort}.`);
    console.log();
    console.log('You have now to configure your RabbitMQ in Stackhero dashboard:');
    console.log('- Enable the "HTTP backend authentication support"');
    console.log(`- Set the "User path" to: ${ngrokUrl}/user`);
    console.log(`- Set the "Vhost path" to: ${ngrokUrl}/vhost`);
    console.log(`- Set the "Resource path" to: ${ngrokUrl}/resource`);
    console.log(`- Set the "Topic path" to: ${ngrokUrl}/topic`);
    console.log();

})().catch(error => {
  ngrok.disconnect();
  ngrok.kill();
  apiServer && apiServer.close();

  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});