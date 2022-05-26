require('dotenv').config()
const amqplib = require('amqplib');

(async () => {
  if (!process.env.RABBITMQ_HOST) {
    throw Error('You should first fill the .env-example file and rename it to .env');
  }

  // Connect to RabbitMQ server
  console.log('🔌  Connecting to RabbitMQ...');
  const connection = await amqplib.connect(
    {
      protocol: 'amqps',
      hostname: process.env.RABBITMQ_HOST,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD
    }
  );
  process.once('SIGTERM', () => connection.close());

  const channel = await connection.createChannel();
  const queue = 'hello';
  await channel.assertQueue(queue, { durable: false });

  // Consume the queue and display content
  console.log(`📭  Consumming queue ${queue}...`);
  channel.consume(
    queue,
    message => {
      console.log(`📬  Received message on queue "${queue}": "` + message.content.toString() + '"');
      console.log('✅  All done, your RabbitMQ works great!');
      process.exit(0);
    },
    { noAck: true }
  );

  // Sending message to queue
  const message = 'Hello world!';
  console.log(`📮  Sending message "${message}" to queue "${queue}"`);
  await channel.sendToQueue(queue, Buffer.from(message));

})().catch(error => {
  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});