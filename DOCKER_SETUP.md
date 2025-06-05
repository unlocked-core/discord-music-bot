# Установка Docker для развертывания бота

## Windows

### Docker Desktop

1. Скачайте Docker Desktop с официального сайта:
   https://www.docker.com/products/docker-desktop/

2. Запустите установщик и следуйте инструкциям

3. После установки перезагрузите компьютер

4. Запустите Docker Desktop

5. Проверьте установку:
   ```powershell
   docker --version
   docker-compose --version
   ```

### Альтернатива: WSL2 + Docker

Если у вас Windows 10/11 Pro, можно использовать WSL2:

1. Включите WSL2
2. Установите Ubuntu из Microsoft Store
3. Установите Docker в WSL2

## Linux (Ubuntu/Debian)

```bash
# Обновляем систему
sudo apt update

# Устанавливаем зависимости
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# Добавляем GPG ключ Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавляем репозиторий Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Устанавливаем Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Устанавливаем Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER

# Перелогиниваемся или выполняем
newgrp docker

# Проверяем установку
docker --version
docker-compose --version
```

## macOS

### Homebrew (рекомендуется)

```bash
# Устанавливаем Homebrew (если не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Устанавливаем Docker
brew install --cask docker

# Или устанавливаем через Docker Desktop
brew install docker docker-compose
```

### Docker Desktop

1. Скачайте Docker Desktop для macOS:
   https://www.docker.com/products/docker-desktop/

2. Установите приложение

3. Запустите Docker Desktop

## Облачные сервисы

### VPS/Dedicated серверы

Большинство VPS провайдеров поддерживают Docker:

- DigitalOcean
- Linode
- Vultr
- Hetzner
- AWS EC2
- Google Cloud Platform
- Microsoft Azure

### Готовые Docker хостинги

- Railway.app
- Render.com
- Fly.io
- Heroku (с Docker)

## Проверка установки

После установки Docker выполните:

```bash
# Проверка версий
docker --version
docker-compose --version

# Тест запуска
docker run hello-world

# Проверка docker-compose
docker-compose --help
```

## Развертывание бота

После установки Docker:

1. Перейдите в папку с ботом
2. Создайте `.env` файл с токеном
3. Запустите скрипт развертывания:

**Linux/macOS:**

```bash
./deploy.sh
```

Или вручную:

```bash
docker-compose up -d --build
```

## Мониторинг

```bash
# Просмотр логов
docker-compose logs -f

# Статус контейнеров
docker-compose ps

# Использование ресурсов
docker stats
```

## Обновление бота

```bash
# Остановка
docker-compose down

# Обновление кода (git pull или замена файлов)

# Пересборка и запуск
docker-compose up -d --build
```
