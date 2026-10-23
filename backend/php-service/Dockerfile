FROM php:7.4-cli
RUN docker-php-ext-install mysqli
WORKDIR /app
COPY *.php ./
CMD ["php", "-S", "0.0.0.0:8080", "-t", "/app"]
