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

      process.once('SIGTERM', () => client.close());

      const frame = client.send({
        destination: `/queue/${queue}`,
        'content-type': 'text/plain'
      });
      const message = 'It\'s ' + Date();
      frame.end(message);
      console.log(`Sent message "${message}"`);

      client.disconnect(error => { if (error) throw error });
    }
  );

})().catch(error => {
  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});
