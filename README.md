# Jira Clone

## О проекте

Этот проект представляет собой клон системы управления задачами Jira, созданный с использованием современных веб-технологий. Приложение позволяет пользователям создавать рабочие пространства, проекты и задачи, управлять ими и контролировать рабочий процесс.

## Технический стек

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Next.js API Routes, Hono
- **База данных**: PostgreSQL с использованием Prisma ORM
- **Аутентификация**: NextAuth
- **Интерфейс**: Radix UI компоненты, Lucide иконки
- **Управление состоянием**: React Query (TanStack Query)
- **Drag and Drop**: @hello-pangea/dnd
- **Формы**: React Hook Form с Zod для валидации
- **Отправка email**: Resend

## Основные функции

- 🔐 Аутентификация пользователей
- 👥 Управление рабочими пространствами и командами
- 📊 Управление проектами
- ✅ Создание и управление задачами
- 📋 Доска задач в стиле Kanban с drag-and-drop
- 📆 Календарь и графики
- 📧 Уведомления по электронной почте
- 🖼️ Загрузка изображений (ограничение: 4MB)

## Настройки проекта

Для работы приложения необходимо создать файл `.env.local` со следующими переменными:

### URL и порт
```
NEXT_PUBLIC_APP_URL=http://localhost:3005
```

### База данных (PostgreSQL)
```
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<db_name>?schema=public
```

### Конфигурация приглашений
```
INVITECODE_LENGTH=8
```

### Ограничения для загрузки файлов
```
MAX_FILE_SIZE=4194304 # 4MB
ACCEPTED_IMAGE_TYPES=["image/jpeg", "image/jpg", "image/png", "image/webp"]
```

### API для отправки email
```
RESEND_API_KEY=<ваш_api_ключ>
```

### NextAuth настройки
```
NEXTAUTH_URL=http://localhost:3005
NEXTAUTH_SECRET=<сгенерированный_секретный_ключ>
```

### Google OAuth (для аутентификации)
```
GOOGLE_CLIENT_ID=<ваш_google_client_id>
GOOGLE_CLIENT_SECRET=<ваш_google_client_secret>
```

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone <URL репозитория>
cd jira-clone
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте окружение:
   - Создайте файл `.env.local` с необходимыми переменными окружения (см. выше)

4. Настройте базу данных:
```bash
npm run prisma:generate
npm run db:reset
```

5. Настройте хранилище для загрузок:
```bash
npm run setup:uploads
```

6. Или выполните полную настройку:
```bash
npm run setup:all
```

7. Запустите приложение:
```bash
npm run dev
```

8. Откройте [http://localhost:3005](http://localhost:3005) в браузере

## Скрипты

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка проекта
- `npm run start` - Запуск собранного проекта
- `npm run lint` - Проверка кода линтером
- `npm run migrate:appwrite` - Миграция данных из Appwrite
- `npm run prisma:generate` - Генерация Prisma клиента
- `npm run prisma:migrate` - Применение миграций Prisma
- `npm run prisma:studio` - Запуск Prisma Studio для управления БД
- `npm run prisma:seed` - Заполнение БД тестовыми данными
- `npm run db:reset` - Сброс БД и заполнение тестовыми данными
- `npm run setup:uploads` - Настройка загрузок
- `npm run setup:all` - Полная настройка проекта

## Модели данных

- **User**: Пользователи системы
- **Workspace**: Рабочие пространства
- **Project**: Проекты в рабочих пространствах
- **Task**: Задачи с различными статусами
- **Member**: Участники рабочего пространства с ролями

## Лицензия

MIT
