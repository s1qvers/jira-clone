# Jira Clone - Полностью русифицированная версия

## Обзор проекта

Это полностью русифицированный клон Jira, разработанный с использованием Next.js и PostgreSQL. Проект мигрирован с Appwrite на Prisma. Для хранения файлов используется Cloudinary. Интерфейс полностью на русском языке, включая даты, календари и статусы задач.

## Предварительные требования

- Node.js 16+ и npm
- PostgreSQL 12+
- База данных PostgreSQL (создайте базу данных `jira_clone`)
- Аккаунт Cloudinary для хранения изображений

## Шаги по настройке

1. Установка зависимостей:
   ```
   npm install
   ```

2. Настройка переменных окружения:
   - Скопируйте `.env.example` в `.env` (если такого файла нет, создайте его)
   - Обновите строку подключения к базе данных:
     ```
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jira_clone?schema=public"
     ```
   - Укажите URL вашего приложения:
     ```
     NEXT_PUBLIC_APP_URL=http://localhost:3000
     ```
   - Добавьте настройки Cloudinary (получите их в панели управления Cloudinary):
     ```
     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
     CLOUDINARY_API_KEY="your_api_key"
     CLOUDINARY_API_SECRET="your_api_secret"
     ```

3. Настройка схемы базы данных:
   ```
   npx prisma migrate dev
   ```

4. Генерация Prisma-клиента:
   ```
   npx prisma generate
   ```

## Миграция данных из Appwrite

Если у вас есть существующие данные в Appwrite и вы хотите их перенести в новую БД, выполните следующие шаги:

1. Временно раскомментируйте переменные Appwrite в `.env` файле:
   ```
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT=ваш_project_id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=ваш_database_id
   NEXT_PUBLIC_APPWRITE_WORKSPACES_ID=ваш_workspaces_id
   NEXT_PUBLIC_APPWRITE_MEMBERS_ID=ваш_members_id
   NEXT_PUBLIC_APPWRITE_PROJECTS_ID=ваш_projects_id
   NEXT_PUBLIC_APPWRITE_TASKS_ID=ваш_tasks_id
   NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=ваш_bucket_id
   NEXT_APPWRITE_KEY=ваш_api_key
   ```

2. Запустите скрипт миграции:
   ```
   npm run migrate:appwrite
   ```

3. После завершения миграции можно удалить переменные Appwrite из .env файла

## Запуск проекта

1. Запустите сервер разработки:
   ```
   npm run dev
   ```

2. Откройте [http://localhost:3000](http://localhost:3000) (или [http://localhost:3001](http://localhost:3001)) в браузере.

## Дополнительные команды

- Запуск Prisma Studio (GUI для просмотра и редактирования БД):
  ```
  npm run prisma:studio
  ```

- Обновление схемы после изменений в `schema.prisma`:
  ```
  npm run prisma:generate
  ```

- Применение миграций в производственной среде:
  ```
  npm run prisma:migrate
  ```

## Основные изменения в коде

При миграции с Appwrite на Prisma были внесены следующие основные изменения:

1. Создана схема Prisma с моделями:
   - User
   - Workspace
   - Project
   - Task
   - Member

2. Реализован новый механизм аутентификации с использованием bcrypt для хеширования паролей

3. Созданы сервисные файлы для работы с моделями данных в каждом feature-модуле

4. Добавлено middleware для сессий

5. Обновлены маршруты API для использования Prisma вместо Appwrite

6. Реализована загрузка изображений через Cloudinary вместо хранилища Appwrite

## Локализация и русификация

Проект полностью русифицирован:

1. Все пользовательские интерфейсы переведены на русский язык

2. Для форматирования дат используется локализация из библиотеки date-fns:
   ```javascript
   import { format } from "date-fns";
   import { ru } from "date-fns/locale";
   
   format(date, "d MMMM yyyy", { locale: ru })
   ```

3. Календари локализованы с использованием:
   - В date-picker: русская локализация react-day-picker
   - В календаре задач: русская локализация react-big-calendar

4. Статусы задач переведены с помощью маппинга:
   ```javascript
   const TaskStatusLabels = {
     "BACKLOG": "Бэклог",
     "TODO": "К выполнению",
     "IN_PROGRESS": "В процессе",
     "IN_REVIEW": "На проверке",
     "DONE": "Выполнено"
   };
   ```

5. Все формы и интерактивные элементы имеют русскоязычные плейсхолдеры и подсказки 