require('dotenv').config()
const stompit = require('stompit');

(async () => {
  if (!process.env.RABBITMQ_HOST) {
    throw Error('You should first fill the .env-example file and rename it to .env');
  }

  const queue = 'test-stomp';
  stompit.connect(
    {
      host: process.env.RABBITMQ_HOST,
      port: 61614,
      ssl: true,
      connectHeaders: {
        host: '/',
        login: process.env.RABBITMQ_USERNAME,
        passcode: process.env.RABBITMQ_PASSWORD,
        'heart-beat': '5000,5000'
      }
    },
    (error, client) => {
      if (error) {
        throw error;
      }
      console.log('Connected');
      console.log('Waiting for messages... You can send one by running `node stompSender.js in an other terminal.`');

      process.once('SIGTERM', () => client.close());

      client.subscribe(
        {
          destination: `/queue/${queue}`,
          ack: 'client-individual'
        },
        (error, message) => {
          if (error) {
            throw error;
          }

          message.readString(
            'utf-8',
            (error, body) => {
              if (error) {
                throw error;
              }

              console.log('Received message: ' + body);
              client.ack(message);
            }
          );
        }
      );
    }
  );

})().catch(error => {
  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});