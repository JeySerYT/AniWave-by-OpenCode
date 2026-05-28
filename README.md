# AniWave

Аниме каталог с современным дизайном в тёмной теме.

[![GitHub](https://img.shields.io/badge/GitHub-JeySerYT/AniWave--by--OpenCode-blue?style=for-the-badge)](https://github.com/JeySerYT/AniWave-by-OpenCode)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?style=for-the-badge)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-blue?style=for-the-badge)](https://fastapi.tiangolo.com/)

## Возможности

- Поиск аниме с фильтрами (жанр, год, статус, сортировка)
- Главная страница с популярными, трендовыми и онгоингами
- Hero-секция с опенингами
- Коллекции на сервере: "Смотрю", "Просмотрено", "Запланировано"
- Синхронизация прогресса просмотра между устройствами
- Страница просмотра аниме с HLS-плеером и выбором качества
- Профиль с кастомизацией (аватар, баннер, описание) — поддержка GIF
- Авторизация через email/password или OAuth (Google, GitHub)
- FAQ, Terms of Service, Privacy Policy, DMCA
- Двуязычный интерфейс (RU/EN)
- Адаптивный дизайн для всех устройств

## Технологии

### Frontend
- **React** 18 + **Vite** 5
- **AniLibria API** (REST, v1)
- **@tanstack/react-query** (кэширование)
- **Framer Motion** (анимации)
- **React Router** (навигация)
- **HLS.js** (видео плеер)

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** + **PostgreSQL**
- **JWT** Authentication (httpOnly cookies)
- **OAuth 2.0** (Google/GitHub)

## Быстрый старт

### Клонирование
```bash
git clone https://github.com/JeySerYT/AniWave-by-OpenCode.git
cd AniWave-by-OpenCode
```

### Frontend
```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build
```

### Backend
```bash
cd backend

# Создание виртуального окружения
python -m venv .venv

# Активация (Windows)
.venv\Scripts\activate

# Активация (Linux/Mac)
source .venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Копирование .env.example в .env и настройка переменных
copy .env.example .env
# Отредактируйте .env с вашими данными

# Запуск сервера
py main.py
```

Откройте http://localhost:5173 в браузере.

## Настройка OAuth

### Google OAuth
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте OAuth 2.0 Client ID
3. Добавьте redirect URI: `http://localhost:8081/api/auth/oauth/google/callback`
4. Скопируйте credentials в `.env`

### GitHub OAuth
1. Перейдите в [GitHub Developer Settings](https://github.com/settings/developers)
2. Создайте новый OAuth App
3. Добавьте authorization callback URL: `http://localhost:8081/api/auth/oauth/github/callback`
4. Скопируйте credentials в `.env`

## Структура проекта

```
src/                    # Frontend
├── api/                # AniLibria API client + backend config
├── components/         # UI компоненты
├── context/            # React Context (Auth, Language)
├── hooks/              # Кастомные хуки (useAnime, useSearch, useCollections)
├── locales/            # Переводы (RU/EN)
├── pages/              # Страницы
├── styles/             # Глобальные стили
├── utils/              # Утилиты
└── assets/             # Статические файлы

backend/                # Backend
├── app/
│   ├── routers/        # API эндпоинты (auth, profile, favorites, watch_progress)
│   ├── services/       # Бизнес-логика
│   ├── models/         # SQLAlchemy модели
│   ├── schemas/        # Pydantic схемы
│   ├── utils/          # Утилиты
│   └── database.py     # Подключение к БД
├── main.py             # Точка входа
└── requirements.txt    # Python зависимости
```

## Дизайн

- Тёмная тема с красно-розовыми акцентами
- Градиенты с glow эффектами
- Плавные анимации Framer Motion
- Полностью адаптивная вёрстка

## API

- **AniLibria REST API** (https://anilibria.top/api/v1) — бесплатный, без ключа API
- Собственный Backend API на `/api/*`

## Лицензия

All Rights Reserved. Смотрите LICENSE для подробностей.
