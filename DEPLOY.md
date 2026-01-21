# 🚀 Деплой Daily Discipline на VPS (TimeWeb Cloud)

## Пошаговая инструкция

---

## Шаг 1: Подготовка GitHub репозитория

### 1.1 Создать репозиторий
```bash
cd /Users/ivanp/Downloads/daily-discipline
git init
git add .
git commit -m "Initial commit"

# Создать репозиторий на github.com, затем:
git remote add origin https://github.com/YOUR_USERNAME/daily-discipline.git
git branch -M main
git push -u origin main
```

### 1.2 Добавить секреты в GitHub
Перейти в **Settings → Secrets and variables → Actions** и добавить:

| Secret Name | Значение |
|------------|----------|
| `VPS_HOST` | IP адрес VPS (например: `123.45.67.89`) |
| `VPS_USER` | Пользователь SSH (например: `root` или `deploy`) |
| `VPS_PORT` | Порт SSH (обычно `22`) |
| `SSH_PRIVATE_KEY` | Содержимое `~/.ssh/id_rsa` (приватный ключ) |
| `GEMINI_API_KEY` | API ключ Google Gemini |

---

## Шаг 2: Настройка VPS

### 2.1 Подключиться к VPS
```bash
ssh root@YOUR_VPS_IP
```

### 2.2 Установить необходимое ПО
```bash
# Обновить систему
apt update && apt upgrade -y

# Установить Nginx
apt install nginx -y

# Установить Node.js (если нужен для сборки на сервере)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install nodejs -y
```

### 2.3 Создать директорию для приложения
```bash
mkdir -p /var/www/daily-discipline
chown -R www-data:www-data /var/www/daily-discipline
```

### 2.4 Настроить Nginx
```bash
nano /etc/nginx/sites-available/daily-discipline
```

Вставить:
```nginx
server {
    listen 80;
    server_name discipline.yourdomain.com;  # Или IP адрес
    root /var/www/daily-discipline;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Активировать:
```bash
ln -s /etc/nginx/sites-available/daily-discipline /etc/nginx/sites-enabled/
nginx -t  # Проверить конфигурацию
systemctl reload nginx
```

### 2.5 Настроить SSH ключ для GitHub Actions
```bash
# На локальной машине сгенерировать ключ (если нет):
ssh-keygen -t rsa -b 4096 -C "deploy@daily-discipline"

# Скопировать публичный ключ на VPS:
ssh-copy-id -i ~/.ssh/id_rsa.pub root@YOUR_VPS_IP

# Приватный ключ добавить в GitHub Secrets как SSH_PRIVATE_KEY
cat ~/.ssh/id_rsa
```

---

## Шаг 3: Первый деплой

### 3.1 Сделать push в main
```bash
git add .
git commit -m "Add deployment config"
git push origin main
```

### 3.2 Проверить GitHub Actions
- Перейти на GitHub → **Actions** → увидеть running workflow
- После успеха приложение будет доступно по адресу VPS

---

## 🐳 Альтернатива: Docker

### Если на VPS уже есть Docker:
```bash
# На VPS:
cd /opt
git clone https://github.com/YOUR_USERNAME/daily-discipline.git
cd daily-discipline

# Создать .env файл
echo "API_KEY=your_gemini_api_key" > .env

# Запустить
docker-compose up -d --build

# Приложение доступно на порту 3001
```

### Обновление через Docker:
```bash
cd /opt/daily-discipline
git pull
docker-compose up -d --build
```

---

## 📋 Чеклист

- [ ] GitHub репозиторий создан
- [ ] Secrets добавлены в GitHub
- [ ] Nginx установлен на VPS
- [ ] SSH ключ настроен
- [ ] Первый push успешен
- [ ] Приложение открывается в браузере

---

## 🔧 Полезные команды

```bash
# Проверить логи Nginx
tail -f /var/log/nginx/error.log

# Проверить статус Nginx
systemctl status nginx

# Перезапустить Nginx
systemctl restart nginx

# Посмотреть что на порту 80
lsof -i :80
```

---

## 🌐 Настройка домена (опционально)

1. Купить домен (например на reg.ru)
2. В DNS добавить A-запись: `discipline.yourdomain.com → YOUR_VPS_IP`
3. Обновить `server_name` в nginx конфиге
4. Установить SSL:
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d discipline.yourdomain.com
```
