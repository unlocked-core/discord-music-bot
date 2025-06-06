# Discord Музыкальный Бот

Простой и безопасный Discord бот для воспроизведения музыки с YouTube.

## Возможности

- Воспроизведение музыки с YouTube по URL
- Система очередей для треков
- Базовые команды управления (play, skip, stop, queue)
- Автоматическое отключение при пустой очереди
- Обработка ошибок и безопасная архитектура

## Требования

- Node.js версии 16.0.0 или выше
- FFmpeg (устанавливается автоматически через ffmpeg-static)
- Discord бот токен

## Установка

1. Клонируйте или скачайте проект
2. Установите зависимости:

```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

4. Получите токен Discord бота:

   - Перейдите на https://discord.com/developers/applications
   - Создайте новое приложение
   - Перейдите в раздел "Bot"
   - **ВАЖНО:** Включите следующие привилегированные интенты:
     - `Message Content Intent` (обязательно)
     - `Server Members Intent` (рекомендуется)
   - Скопируйте токен и вставьте в файл `.env`

5. Пригласите бота на сервер:
   - В разделе "OAuth2" → "URL Generator"
   - Выберите scope: `bot`
   - Выберите permissions:
     - `Send Messages` (отправка сообщений)
     - `Connect` (подключение к голосовым каналам)
     - `Speak` (воспроизведение звука)
     - `Use Voice Activity` (использование голосовой активности)
   - Скопируйте сгенерированную ссылку
   - Откройте ссылку в браузере и выберите сервер для добавления бота
   - Подтвердите права доступа

## Запуск

### Обычный запуск (локально)

```bash
npm start
```

Для разработки с автоперезагрузкой:

```bash
npm run dev
```

### Docker развертывание (рекомендуется для серверов)

#### Быстрый запуск

**Linux/macOS:**

```bash
./deploy.sh
```

#### Ручное развертывание

1. Убедитесь, что Docker и Docker Compose установлены
2. Создайте файл `.env` из `.env.example` и добавьте токен
3. Запустите:

```bash
# Сборка и запуск
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

## Команды

| Команда                      | Описание                          |
| ---------------------------- | --------------------------------- |
| `!play <URL>` или `!p <URL>` | Добавить трек в очередь           |
| `!skip` или `!s`             | Пропустить текущий трек           |
| `!stop`                      | Остановить и очистить очередь     |
| `!queue` или `!q`            | Показать очередь                  |
| `!help` или `!h`             | Показать команды (красивый embed) |

## Безопасность

- Валидация URL YouTube
- Обработка ошибок на всех уровнях
- Автоматическая очистка ресурсов
- Проверка прав пользователя (нахождение в голосовом канале)

## Структура проекта

```
discord-music-bot/
├── index.js              # Основной файл бота
├── package.json          # Зависимости и скрипты
├── .env.example          # Пример файла конфигурации
├── Dockerfile            # Docker образ
├── docker-compose.yml    # Docker Compose конфигурация
├── .dockerignore         # Исключения для Docker
├── deploy.sh             # Скрипт развертывания (Linux/macOS)
├── deploy.ps1            # Скрипт развертывания (Windows)
└── README.md             # Документация
```

## Docker развертывание

### Преимущества Docker

- **Изолированная среда:** Бот работает в отдельном контейнере
- **Легкое развертывание:** Один контейнер на любом сервере
- **Автоматический перезапуск:** При сбоях или перезагрузке сервера
- **Ограничение ресурсов:** Контроль использования CPU и памяти
- **Простое обновление:** Пересборка и перезапуск одной командой

### Системные требования для Docker

- Docker Engine 20.10+
- Docker Compose 1.29+
- 512MB RAM (минимум)
- 1GB свободного места

### Команды управления

```bash
# Запуск в фоне
docker-compose up -d

# Просмотр логов в реальном времени
docker-compose logs -f

# Перезапуск бота
docker-compose restart

# Остановка
docker-compose down

# Пересборка и запуск (после изменений кода)
docker-compose up -d --build

# Просмотр статуса
docker-compose ps

# Вход в контейнер (для отладки)
docker-compose exec discord-bot sh
```

## Устранение неполадок

### Бот не подключается

- Проверьте правильность токена в файле `.env`
- Убедитесь, что бот приглашен на сервер с нужными правами

### Ошибка "Missing Permissions"

Если вы видите ошибку `DiscordAPIError[50013]: Missing Permissions`, это означает, что у бота недостаточно прав:

1. **Проверьте права бота на сервере:**

   - Зайдите в настройки сервера → Роли
   - Найдите роль вашего бота
   - Убедитесь, что включены права:
     - `Отправлять сообщения`
     - `Встраивать ссылки` (для команды help)
     - `Подключаться` (к голосовым каналам)
     - `Говорить` (в голосовых каналах)

2. **Проверьте права в конкретном канале:**

   - Правый клик на канал → Изменить канал → Права доступа
   - Убедитесь, что роль бота имеет нужные права

3. **Пересоздайте приглашение с правильными правами:**
   - Используйте ссылку из раздела "Установка" выше
   - Убедитесь, что выбраны все необходимые права

### Ошибки воспроизведения

- Убедитесь, что URL YouTube корректный и видео доступно
- Проверьте подключение к интернету
- Некоторые видео могут быть заблокированы для воспроизведения

### Проблемы с голосовым каналом

- Убедитесь, что вы находитесь в голосовом канале
- Проверьте права бота на подключение к голосовым каналам

### Предупреждения в редакторе

- Предупреждение о схеме JSON в package.json можно игнорировать - это не влияет на работу бота
- Предупреждения о deprecated версиях @discordjs/voice не критичны для функциональности

## Лицензия

MIT License
