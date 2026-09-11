FROM richarvey/nginx-php-fpm:3.1.6

# Αντιγραφή όλου του κώδικα στο container
COPY . /var/www/html

# Ρύθμιση του Webroot στον φάκελο public του Laravel
ENV WEBROOT /var/www/html/public
ENV APP_ENV production

# Εγκατάσταση των dependencies του Composer
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Δικαιώματα φακέλων για το Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Η πόρτα που θα ακούει το Render
EXPOSE 80