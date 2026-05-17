FROM php:8.2-apache

# Install MongoDB PHP extension and required libs
RUN apt-get update && apt-get install -y \
    libssl-dev pkg-config unzip curl \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && a2enmod rewrite \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies
COPY composer.json composer.lock* ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy application files
COPY . .

# Create upload directories and set permissions
RUN mkdir -p uploads/vendors uploads/companies \
    && chown -R www-data:www-data uploads \
    && chmod -R 755 uploads

# Apache virtual host — no RewriteBase needed (backend is at root)
COPY apache.conf /etc/apache2/sites-available/000-default.conf

EXPOSE 80
