# Getting started guide for RabbitMQ on Stackhero with PHP


docker run -it -v $(pwd):/mnt alpine:3.14.3
apk add composer php7 php7-sockets
cd /tmp


composer require vlucas/phpdotenv
composer require php-amqplib/php-amqplib