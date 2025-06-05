# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем ffmpeg для обработки аудио
RUN apk add --no-cache ffmpeg

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S botuser -u 1001

# Меняем владельца файлов
RUN chown -R botuser:nodejs /app
USER botuser

# Открываем порт (не обязательно для Discord бота, но для мониторинга)
EXPOSE 3000

# Запускаем бота
CMD ["npm", "start"]
