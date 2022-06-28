require('dotenv').config();
const mqtt = require('mqtt');

if (!process.env.RABBITMQ_HOST) {
  throw Error('You should first fill the .env-example file and rename it to .env');
}

const client = mqtt.connect(`mqtts://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:1884`);
const topic = 'test-mqtt';

// Publish a message when the client connects
client.on(
  'connect',
  () => {
    process.once('SIGTERM', () => client.end());
    const message = 'It\'s ' + Date();
    client.publish(topic, message);
    console.log(`Sent message "${message}" to topic ${topic}`);
    client.end();
  }
);
