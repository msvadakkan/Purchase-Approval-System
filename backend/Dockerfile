FROM php:8.2-apache

# curl and unzip must come first — used by install-php-extensions below
RUN apt-get update && apt-get install -y curl unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN curl -sSLf \
    'https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions' \
    -o /usr/local/bin/install-php-extensions \
    && chmod +x /usr/local/bin/install-php-extensions \
    && install-php-extensions mongodb

RUN a2enmod rewrite

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs

COPY . .

RUN mkdir -p uploads/vendors uploads/companies \
    && chown -R www-data:www-data uploads \
    && chmod -R 755 uploads

COPY apache.conf /etc/apache2/sites-available/000-default.conf

EXPOSE 80
