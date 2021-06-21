FROM php:8
RUN apt update && apt install cron nano -y
RUN docker-php-ext-install mysqli pdo pdo_mysql && docker-php-ext-enable pdo_mysql
RUN curl https://getcomposer.org/installer -o composer.phar
RUN chmod +x composer.phar
RUN mv composer.phar /usr/local/bin/composer
