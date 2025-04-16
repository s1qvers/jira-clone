import { PrismaClient } from "../src/generated/prisma";
import * as bcrypt from "bcrypt";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Проверяем наличие директории для загрузок
function ensureUploadsDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    console.log("Создаем директорию для загрузок:", uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

// Функция для создания тестового пользователя
async function createUser() {
  const password = await bcrypt.hash("password123", 10);
  
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Тестовый Пользователь",
      password,
    },
  });
  
  console.log(`Создан пользователь с ID: ${user.id}`);
  return user;
}

// Создание рабочего пространства
async function createWorkspace(userId: string) {
  const workspace = await prisma.workspace.create({
    data: {
      name: "Тестовое рабочее пространство",
      imageUrl: "/placeholder.png",
      inviteCode: `invite-${Date.now()}`,
      userId,
    },
  });
  
  // Создаем запись участника (владельца)
  await prisma.member.create({
    data: {
      workspaceId: workspace.id,
      userId,
      role: "ADMIN",
    },
  });
  
  console.log(`Создано рабочее пространство с ID: ${workspace.id}`);
  return workspace;
}

// Создание проектов
async function createProjects(workspaceId: string) {
  // Тестовые проекты с разными названиями и изображениями
  const projectsData = [
    { name: "Разработка веб-приложения", imageUrl: "/uploads/project-blue.png" },
    { name: "Мобильное приложение", imageUrl: "/uploads/project-red.png" },
    { name: "Маркетинговая кампания", imageUrl: "/uploads/project-green.png" },
    { name: "Дизайн продукта", imageUrl: "/uploads/project-purple.png" },
    { name: "Исследование пользователей", imageUrl: "/uploads/project-orange.png" }
  ];
  
  const projects = [];
  
  for (const projectData of projectsData) {
    // Проверяем наличие файла изображения
    const imagePath = path.join(process.cwd(), 'public', projectData.imageUrl.replace(/^\//, ''));
    let imageUrl = projectData.imageUrl;
    
    // Если файл не существует, используем плейсхолдер
    if (!fs.existsSync(imagePath)) {
      console.log(`Файл изображения ${imagePath} не найден, используем плейсхолдер`);
      imageUrl = "/placeholder.png";
    }
    
    const project = await prisma.project.create({
      data: {
        name: projectData.name,
        imageUrl: imageUrl,
        workspaceId,
      },
    });
    
    console.log(`Создан проект с ID: ${project.id}, название: ${project.name}`);
    projects.push(project);
  }
  
  return projects;
}

// Создание задач
async function createTasks(projectId: string, workspaceId: string, userId: string) {
  const statuses: Array<"BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"> = [
    "BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"
  ];
  
  for (let i = 0; i < 10; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const position = i * 1000; // Базовая позиция для сортировки
    
    await prisma.task.create({
      data: {
        name: `Задача #${i + 1}`,
        status,
        position,
        description: `Описание задачи #${i + 1}`,
        workspaceId,
        projectId,
        assigneeId: userId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через неделю
      },
    });
  }
  
  console.log(`Создано 10 тестовых задач для проекта ${projectId}`);
}

async function main() {
  console.log("Запуск сидера для Prisma...");
  
  try {
    // Проверяем наличие директории для загрузок
    ensureUploadsDir();
    
    // Очищаем базу данных (в обратном порядке для соблюдения ограничений внешних ключей)
    console.log("Очистка базы данных...");
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.member.deleteMany({});
    await prisma.workspace.deleteMany({});
    await prisma.user.deleteMany({});
    
    // Создаем тестовые данные
    const user = await createUser();
    const workspace = await createWorkspace(user.id);
    const projects = await createProjects(workspace.id);
    
    // Создаем задачи для каждого проекта
    for (const project of projects) {
      await createTasks(project.id, workspace.id, user.id);
    }
    
    console.log("Сидинг успешно завершен!");
  } catch (error) {
    console.error("Ошибка при сидинге:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 