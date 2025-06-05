
# Скрипт для быстрого развертывания Discord музыкального бота

echo "Развертывание Discord музыкального бота..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

# Проверяем наличие docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
    exit 1
fi

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "Файл .env не найден. Создаем из шаблона..."
    cp .env.example .env
    echo "Отредактируйте файл .env и добавьте ваш Discord токен:"
    echo "DISCORD_TOKEN=ваш_токен_здесь"
    echo ""
    echo "После редактирования .env запустите скрипт снова."
    exit 1
fi

# Проверяем, что токен установлен
if ! grep -q "DISCORD_TOKEN=" .env || grep -q "DISCORD_TOKEN=$" .env; then
    echo "Discord токен не установлен в .env файле."
    echo "Отредактируйте файл .env и добавьте ваш Discord токен."
    exit 1
fi

echo "Все проверки пройдены. Запускаем бота..."

# Останавливаем существующие контейнеры
echo "Останавливаем существующие контейнеры..."
docker-compose down

# Собираем образ
echo "Собираем Docker образ..."
docker-compose build

# Запускаем контейнер
echo "Запускаем бота..."
docker-compose up -d

# Проверяем статус
echo "Проверяем статус контейнера..."
sleep 3
docker-compose ps

echo ""
echo "Бот развернут!"
echo "Полезные команды:"
echo "   docker-compose logs -f          # Просмотр логов"
echo "   docker-compose restart          # Перезапуск"
echo "   docker-compose down             # Остановка"
echo "   docker-compose up -d --build    # Пересборка и запуск"
