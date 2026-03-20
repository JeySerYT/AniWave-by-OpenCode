# AniWave 🎬

Аниме каталог с современным дизайном в тёмной теме.

[![GitHub](https://img.shields.io/badge/GitHub-JeySerYT/AniWave--by--OpenCode-blue?style=for-the-badge)](https://github.com/JeySerYT/AniWave-by-OpenCode)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?style=for-the-badge)](https://vitejs.dev/)

## ✨ Возможности

- 🔍 Поиск аниме с фильтрами (жанр, год, тип, статус)
- 🏠 Главная страница с трендовыми, популярными и сезонными аниме
- 📺 Hero-секция с трейлерами
- ❤️ Избранное (сохраняется в localStorage)
- 👤 Профиль с кастомизацией (баннер, аватар, описание)
- ❓ FAQ — часто задаваемые вопросы
- 📄 Условия использования
- 🔒 Политика конфиденциальности
- 📱 Адаптивный дизайн для всех устройств
- 🎨 Современные карточки с liquid glass эффектами

## 🛠 Технологии

- **React** 18 + **Vite** 5
- **AniList API** (GraphQL)
- **Apollo Client**
- **Framer Motion** (анимации)
- **React Router** (навигация)
- **CSS** (кастомные стили)

## 🚀 Установка

```bash
# Клонирование репозитория
git clone https://github.com/JeySerYT/AniWave-by-OpenCode.git
cd AniWave-by-OpenCode

# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build
```

## 📁 Структура проекта

```
src/
├── api/           # Apollo Client и GraphQL запросы
├── components/    # UI компоненты (AnimeCard, Header, Hero, Footer, etc.)
├── context/       # React Context (язык)
├── hooks/         # Кастомные хуки (useAnime, useFavorites, useSearch)
├── locales/       # Переводы
├── pages/         # Страницы (Home, Search, Profile, AnimeDetails, FAQ, etc.)
├── styles/        # Глобальные стили и переменные
└── assets/       # Статические файлы (logo.svg, favicon.svg)
```

## 🎨 Дизайн

- Тёмная тема с красно-розовыми акцентами
- Градиенты с glow эффектами
- Liquid glass эффекты для карточек
- Плавные анимации Framer Motion
- Полностью адаптивная вёрстка

## 📡 API

Используется [AniList GraphQL API](https://anilist.co/graphql) — бесплатный, без ключа API.

## 📝 Лицензия

MIT

---

Сделано с ❤️
