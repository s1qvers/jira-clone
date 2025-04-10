import { Client, Databases } from "node-appwrite";
import { PrismaClient } from "@/generated/prisma";
import * as bcrypt from "bcrypt";

// Инициализация клиентов
const appwrite = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
  .setKey(process.env.NEXT_APPWRITE_KEY!);

const databases = new Databases(appwrite);
const prisma = new PrismaClient();

// ID коллекций Appwrite
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const WORKSPACE_ID = process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID!;
const MEMBERS_ID = process.env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID!;
const PROJECTS_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID!;
const TASKS_ID = process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID!;

// Вспомогательные мэппинги для хранения соответствий ID
const userIdMap = new Map<string, string>();
const workspaceIdMap = new Map<string, string>();
const projectIdMap = new Map<string, string>();

async function migrateUsers() {
  console.log('Миграция пользователей...');
  // Получаем пользователей из Appwrite
  // Примечание: В Appwrite есть отдельный API users, который требует специальных прав
  // В данном примере мы будем собирать уникальных пользователей из участников рабочих пространств
  
  const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID);
  const uniqueUserIds = new Set<string>();
  
  members.documents.forEach(member => {
    uniqueUserIds.add(member.userId);
  });
  
  // Для каждого уникального ID пользователя создаем запись в Prisma
  // Так как у нас нет доступа к хешам паролей из Appwrite, мы создадим временные пароли
  for (const appwriteUserId of Array.from(uniqueUserIds)) {
    // Этот код условный, так как нам нужно получить данные пользователя из Appwrite
    // Вам нужно будет адаптировать его под вашу структуру данных
    try {
      // В реальном сценарии здесь должен быть запрос к API пользователей Appwrite
      // Для примера создадим временного пользователя
      const tempPassword = await bcrypt.hash('tempPassword123', 10);
      
      const newUser = await prisma.user.create({
        data: {
          email: `user_${appwriteUserId}@example.com`, // Временный имейл, нужно заменить на реальный
          name: `User ${appwriteUserId.substring(0, 6)}`, // Временное имя
          password: tempPassword,
        }
      });
      
      // Сохраняем соответствие ID
      userIdMap.set(appwriteUserId, newUser.id);
      console.log(`Мигрирован пользователь: ${appwriteUserId} -> ${newUser.id}`);
    } catch (error) {
      console.error(`Ошибка миграции пользователя ${appwriteUserId}:`, error);
    }
  }
}

async function migrateWorkspaces() {
  console.log('Миграция рабочих пространств...');
  const workspaces = await databases.listDocuments(DATABASE_ID, WORKSPACE_ID);
  
  for (const workspace of workspaces.documents) {
    try {
      // Получаем новый ID пользователя-владельца
      const newUserId = userIdMap.get(workspace.userId);
      if (!newUserId) {
        console.warn(`Пропуск рабочего пространства ${workspace.$id}: пользователь ${workspace.userId} не найден`);
        continue;
      }
      
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: workspace.name,
          imageUrl: workspace.imageUrl,
          inviteCode: workspace.inviteCode,
          userId: newUserId
        }
      });
      
      workspaceIdMap.set(workspace.$id, newWorkspace.id);
      console.log(`Мигрировано рабочее пространство: ${workspace.$id} -> ${newWorkspace.id}`);
    } catch (error) {
      console.error(`Ошибка миграции рабочего пространства ${workspace.$id}:`, error);
    }
  }
}

async function migrateMembers() {
  console.log('Миграция участников...');
  const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID);
  
  for (const member of members.documents) {
    try {
      const newUserId = userIdMap.get(member.userId);
      const newWorkspaceId = workspaceIdMap.get(member.workspaceId);
      
      if (!newUserId || !newWorkspaceId) {
        console.warn(`Пропуск участника ${member.$id}: пользователь ${member.userId} или рабочее пространство ${member.workspaceId} не найдены`);
        continue;
      }
      
      await prisma.member.create({
        data: {
          userId: newUserId,
          workspaceId: newWorkspaceId,
          role: member.role
        }
      });
      
      console.log(`Мигрирован участник: ${member.$id}`);
    } catch (error) {
      console.error(`Ошибка миграции участника ${member.$id}:`, error);
    }
  }
}

async function migrateProjects() {
  console.log('Миграция проектов...');
  const projects = await databases.listDocuments(DATABASE_ID, PROJECTS_ID);
  
  for (const project of projects.documents) {
    try {
      const newWorkspaceId = workspaceIdMap.get(project.workspaceId);
      
      if (!newWorkspaceId) {
        console.warn(`Пропуск проекта ${project.$id}: рабочее пространство ${project.workspaceId} не найдено`);
        continue;
      }
      
      const newProject = await prisma.project.create({
        data: {
          name: project.name,
          imageUrl: project.imageUrl,
          workspaceId: newWorkspaceId
        }
      });
      
      projectIdMap.set(project.$id, newProject.id);
      console.log(`Мигрирован проект: ${project.$id} -> ${newProject.id}`);
    } catch (error) {
      console.error(`Ошибка миграции проекта ${project.$id}:`, error);
    }
  }
}

async function migrateTasks() {
  console.log('Миграция задач...');
  const tasks = await databases.listDocuments(DATABASE_ID, TASKS_ID);
  
  for (const task of tasks.documents) {
    try {
      const newWorkspaceId = workspaceIdMap.get(task.workspaceId);
      const newProjectId = projectIdMap.get(task.projectId);
      const newAssigneeId = userIdMap.get(task.assigneeId);
      
      if (!newWorkspaceId || !newProjectId || !newAssigneeId) {
        console.warn(`Пропуск задачи ${task.$id}: одно из необходимых значений не найдено`);
        continue;
      }
      
      await prisma.task.create({
        data: {
          name: task.name,
          description: task.description,
          status: task.status,
          position: task.position,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          assigneeId: newAssigneeId,
          workspaceId: newWorkspaceId,
          projectId: newProjectId
        }
      });
      
      console.log(`Мигрирована задача: ${task.$id}`);
    } catch (error) {
      console.error(`Ошибка миграции задачи ${task.$id}:`, error);
    }
  }
}

async function main() {
  console.log('Начало миграции данных из Appwrite в Prisma...');
  
  try {
    // Выполняем миграцию в правильном порядке
    await migrateUsers();
    await migrateWorkspaces();
    await migrateMembers();
    await migrateProjects();
    await migrateTasks();
    
    console.log('Миграция успешно завершена!');
  } catch (error) {
    console.error('Ошибка при миграции:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 