require('dotenv').config()
const amqplib = require('amqplib');


// IMPORTANT: you should first activate the "Delayed Message" plugin in Stackhero's console.
// See our documentation for more informations on https://www.stackhero.io/documentations/
const exchange = 'delayed-exchange';
const queue = 'my-queue';
const delay = 3000;


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
  await channel.assertQueue(queue, { durable: false });
  await channel.assertExchange(exchange, 'x-delayed-message', { arguments: { 'x-delayed-type': 'direct' } });
  await channel.bindQueue(queue, exchange, queue);


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

  // Sending message
  const message = `You will receive me in ${delay}ms!`;
  console.log(`📮  Publishing "${message}" to exchange "${exchange}" and queue "${queue}" with a delay of ${delay}ms`);
  await channel.publish(
    exchange,
    queue,
    Buffer.from(message),
    { headers: { 'x-delay': delay } }
  );

})().catch(error => {
  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});