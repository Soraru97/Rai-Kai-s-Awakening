# VoteBox

Современная платформа для проведения многоэтапных голосований с изображениями. Production-ready приложение на React + Firebase с тёмным дизайном в стиле Steam/Discord.

## Возможности

- 🗳️ Многоэтапное голосование с неограниченным количеством этапов
- 🖼️ Карточки с изображениями (по прямой ссылке URL) и анимациями выбора (Framer Motion)
- 🎯 Настраиваемый лимит выбора на каждом этапе (`maxChoices`)
- ⏱️ Таймер обратного отсчёта до старта/окончания голосования
- 🔒 Защита от повторного голосования без регистрации (localStorage + cookie + browser fingerprint)
- 🌍 Определение страны пользователя по IP (без хранения сырого IP)
- 📊 Результаты в реальном времени (Firestore onSnapshot)
- 👨‍💼 Полноценная админ-панель с Firebase Authentication
- 📈 Статистика: голоса по этапам, страны, активность по времени
- 📥 Экспорт результатов в CSV и Excel
- 🎨 Тёмный современный дизайн со стеклянными панелями и градиентами

## Стек технологий

- **React 18** + **Vite** — быстрая сборка и dev-сервер
- **React Router v6** — клиентский роутинг
- **Tailwind CSS** — utility-first стилизация
- **Firebase** (Firestore, Authentication) — бэкенд без сервера
- **Framer Motion** — анимации интерфейса
- **Recharts** — графики в админ-панели
- **SheetJS (xlsx)** — экспорт в Excel
- **date-fns** — работа с датами (с локализацией ru)
- **react-hot-toast** — уведомления

## Структура проекта

```
src/
├── components/       # Переиспользуемые компоненты
│   ├── ui/           # Базовые UI-элементы (Button, Modal, Input...)
│   ├── voting/       # Компоненты процесса голосования
│   ├── admin/        # Компоненты админ-панели
├── pages/            # Страницы (роуты)
│   └── admin/        # Страницы админ-панели
├── layouts/          # Обёртки макетов (MainLayout, AdminLayout)
├── hooks/            # Кастомные React-хуки
├── services/         # Бизнес-логика и работа с Firebase
├── firebase/         # Инициализация и конфигурация Firebase
├── contexts/         # React Context (Auth, Poll)
├── utils/            # Вспомогательные функции
├── data/             # Статические данные/константы
└── styles/           # Глобальные стили
```

## Установка

### 1. Клонирование и установка зависимостей

```bash
npm install
```

### 2. Настройка Firebase

1. Создайте проект на [Firebase Console](https://console.firebase.google.com/)
2. Включите **Firestore Database** и **Authentication** (метод Email/Password)
   - Firebase Storage не используется — изображения карточек добавляются по прямой ссылке (URL), что работает полностью на бесплатном тарифе Spark, без необходимости подключать карту
3. Скопируйте конфигурацию проекта
4. Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

5. Заполните переменные окружения значениями из вашего Firebase проекта

### 3. Развёртывание правил безопасности

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy --only firestore:rules,firestore:indexes
```

### 4. Создание администратора

В Firebase Console → Authentication → Users → Add user, создайте пользователя с email/паролем — это будет учётная запись администратора.

### 5. Запуск проекта

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:5173`.

Админ-панель: `http://localhost:5173/admin/login`

## Структура базы данных Firestore

```
settings/global
  - activePollId: string
  - maintenanceMode: boolean

polls/{pollId}
  - title, description, startDate, endDate, isActive

  stages/{stageId}
    - title, description, order, maxChoices
    - cards: [{ id, title, imageUrl }]

  votes/{voteId}
    - browserId (hashed fingerprint)
    - ipHash, country, region
    - stages: { [stageId]: [cardId, ...] }
    - createdAt

  results/{stageId}
    - stageTitle, stageOrder, totalVotes
    - cards: { [cardId]: { title, votes, imageUrl } }
```

## Защита от повторного голосования

Поскольку регистрация отсутствует, защита реализована многоуровнево:

1. **localStorage** — хранит ID браузера и список голосований, в которых уже участвовал пользователь
2. **Cookie** — резервное хранилище ID браузера (на случай очистки localStorage)
3. **Browser fingerprint** — SHA-256 хэш из набора характеристик браузера (user agent, разрешение экрана, часовой пояс и т.д.)
4. **Firestore transaction** — финальная проверка на сервере перед записью голоса, исключающая гонки состояний

## Production сборка

```bash
npm run build
npm run preview
```

Собранные файлы появятся в папке `dist/`, готовые к деплою на Firebase Hosting, Vercel, Netlify или любой статический хостинг.

```bash
firebase deploy --only hosting
```

## Лицензия

Проект создан как техническое решение по индивидуальному заказу.
