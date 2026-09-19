# Imagen de despliegue del Portafolio v4.0 · Plásticos Carmen
#
# PHP 8.4 sobre Alpine, servidor embebido de Laravel. Alcanza de sobra: el
# tablero es una sola página y un JSON, y no hay usuarios concurrentes que
# justifiquen nginx + php-fpm.
FROM php:8.4-cli-alpine

RUN apk add --no-cache git unzip icu-dev libzip-dev oniguruma-dev sqlite \
 && docker-php-ext-configure intl \
 && docker-php-ext-install -j"$(nproc)" intl zip pdo_mysql opcache \
 && rm -rf /var/cache/apk/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Primero sólo lo que define las dependencias: así el caché de capas sirve
# mientras no cambien, y cada despliegue no vuelve a bajar todo Laravel.
COPY composer.json composer.lock* ./
# Con composer.lock se instala exactamente lo bloqueado; sin él, se resuelve.
RUN if [ -f composer.lock ]; then \
      composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction; \
    else \
      composer update --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction; \
    fi

COPY . .

RUN composer dump-autoload --optimize --no-dev \
 && cp -n .env.example .env \
 && mkdir -p database storage/framework/{cache/data,sessions,views} storage/logs bootstrap/cache \
 && chmod -R 777 storage bootstrap/cache

EXPOSE 8000

CMD ["sh", "-c", "\
  php artisan key:generate --force && \
  touch database/database.sqlite && \
  php artisan migrate:fresh --force --seed && \
  php artisan config:cache && \
  php artisan route:cache && \
  php artisan view:cache && \
  php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
