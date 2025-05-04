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

## Настройка проекта с нуля

### Шаг 1: Клонирование репозитория
```
git clone https://github.com/s1qvers/jira-clone.git
cd jira-clone
```

### Шаг 2: Установка зависимостей
```
npm install
```

### Шаг 3: Настройка базы данных PostgreSQL
1. Установите PostgreSQL с [официального сайта](https://www.postgresql.org/download/windows/)
2. Во время установки запомните пароль для пользователя postgres (по умолчанию "postgres")
3. Создайте базу данных с названием "jira_clone":
   - Откройте pgAdmin
   - Щелкните правой кнопкой мыши на "PostgreSQL" → "Create" → "Database"
   - Введите имя "jira_clone" и сохраните

### Шаг 4: Настройка переменных окружения
1. Создайте файл `.env` в корне проекта со следующим содержимым:
```
# URL и порт
NEXT_PUBLIC_APP_URL=http://localhost:3005

# Приглашения
INVITECODE_LENGTH=8

# Загрузка файлов
MAX_FILE_SIZE=4194304
ACCEPTED_IMAGE_TYPES=["image/jpeg", "image/jpg", "image/png", "image/webp"]

# Email
RESEND_API_KEY=your_resend_api_key

# Аутентификация
NEXTAUTH_URL=http://localhost:3005
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Шаг 5: Настройка Prisma схемы
Откройте файл `prisma/schema.prisma` и убедитесь, что URL базы данных указан напрямую:
```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://postgres:postgres@localhost:5432/jira_clone?schema=public"
}
```
Если у вас другие учетные данные PostgreSQL, измените URL соответственно.

### Шаг 6: Генерация Prisma клиента
```
npx prisma generate
```

### Шаг 7: Подготовка базы данных и заполнение тестовыми данными
```
npx prisma migrate reset --force
tsx prisma/seed.ts
```

### Шаг 8: Настройка хранилища загрузок
```
npm run setup:uploads
```

### Шаг 9: Запуск приложения
```
npm run dev
```
Приложение будет доступно по адресу: http://localhost:3005

## Дополнительные команды

### Запуск Prisma Studio (визуальный редактор базы данных)
```
npx prisma studio
```
Prisma Studio будет доступен по адресу: http://localhost:5556

### Сборка проекта для продакшена
```
npm run build
npm run start
```

### Проверка кода линтером
```
npm run lint
```

## Решение проблем

### Если Prisma Studio не видит переменную окружения DATABASE_URL
Это известная проблема с Prisma Studio на Windows. Убедитесь, что URL базы данных указан напрямую в `schema.prisma`, как показано в шаге 5.

### Если при генерации Prisma клиента возникает ошибка EPERM
1. Закройте все программы, которые могут использовать файлы проекта (VS Code и др.)
2. Удалите папку `src/generated/prisma`
3. Запустите PowerShell от имени администратора и выполните:
```
cd путь_к_проекту
npx prisma generate
```

### Если Git выдает ошибку об идентификации
Настройте Git с вашими данными:
```
git config --global user.email "ваша_почта@example.com"
git config --global user.name "Ваше Имя"
```

## Работа с Git

Файл `.env` добавлен в `.gitignore` и не должен коммититься в репозиторий, так как содержит секретные данные.

## Структура проекта

- **prisma/**: Схема базы данных и скрипты миграции
- **src/**: Исходный код приложения
  - **app/**: Компоненты приложения Next.js
  - **components/**: Общие UI компоненты
  - **features/**: Функциональные модули
  - **generated/**: Автоматически сгенерированный код
  - **lib/**: Вспомогательные функции и утилиты
- **public/**: Статические файлы (изображения, шрифты)

## Лицензия

MIT
