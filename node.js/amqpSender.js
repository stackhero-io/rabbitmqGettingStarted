require('dotenv').config();
const amqplib = require('amqplib');

(async () => {
  if (!process.env.RABBITMQ_HOST) {
    throw Error('You should first fill the .env-example file and rename it to .env');
  }

  const message = 'It\'s ' + Date();
  const queue = 'test-amqp';

  const connection = await amqplib.connect(
    {
      protocol: 'amqps',
      hostname: process.env.RABBITMQ_HOST,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD
    }
  );
  console.log('Connected');
  process.once('SIGTERM', () => connection.close());

  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: false });
  await channel.sendToQueue(queue, Buffer.from(message), {});
  console.log(`Sent message "${message}" to queue ${queue}`);

  await channel.close();
  await connection.close();

})().catch(error => {
  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});