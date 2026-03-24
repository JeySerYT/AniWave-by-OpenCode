# AniWave

Аниме каталог с современным дизайном в тёмной теме.

[![GitHub](https://img.shields.io/badge/GitHub-JeySerYT/AniWave--by--OpenCode-blue?style=for-the-badge)](https://github.com/JeySerYT/AniWave-by-OpenCode)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?style=for-the-badge)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-blue?style=for-the-badge)](https://fastapi.tiangolo.com/)

## Возможности

- Поиск аниме с фильтрами (жанр, год, тип, статус)
- Главная страница с трендовыми, популярными и сезонными аниме
- Hero-секция с трейлерами
- Избранное (сохраняется на сервере)
- Профиль с кастомизацией (баннер, аватар, описание)
- Авторизация через email/password или OAuth (Google, GitHub)
- FAQ — часто задаваемые вопросы
- Условия использования
- Политика конфиденциальности
- Адаптивный дизайн для всех устройств
- Карточки с liquid glass эффектами

## Технологии

### Frontend
- **React** 18 + **Vite** 5
- **AniList API** (GraphQL)
- **Apollo Client**
- **Framer Motion** (анимации)
- **React Router** (навигация)
- **CSS** (кастомные стили)

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** + **PostgreSQL**
- **JWT** Authentication
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
├── api/                # Apollo Client и GraphQL запросы
├── components/         # UI компоненты
├── context/            # React Context (Auth, Language)
├── hooks/              # Кастомные хуки
├── locales/            # Переводы
├── pages/              # Страницы
├── styles/             # Глобальные стили
└── assets/             # Статические файлы

backend/                # Backend
├── app/
│   ├── routers/        # API эндпоинты
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
- Liquid glass эффекты для карточек
- Плавные анимации Framer Motion
- Полностью адаптивная вёрстка

## API

- **AniList GraphQL API** (https://anilist.co/graphql) — бесплатный, без ключа API
- Собственный Backend API на `/api/*`

## Лицензия

MIT
