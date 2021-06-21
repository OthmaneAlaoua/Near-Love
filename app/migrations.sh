docker exec -ti customer-api-168 bash -c "php artisan migrate:fresh"
docker exec -ti localisation-api-168 bash -c "php artisan migrate:fresh"
cd chat-api && npx sequelize-cli db:migrate