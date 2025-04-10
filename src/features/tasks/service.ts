import { prisma } from "@/lib/prisma";
import { TaskStatus } from "../tasks/types";

export async function createTask(
  workspaceId: string,
  projectId: string,
  assigneeId: string,
  data: {
    name: string;
    description?: string;
    status?: TaskStatus;
    dueDate?: Date;
  }
) {
  try {
    console.log("createTask вызван с параметрами:", {
      workspaceId,
      projectId,
      assigneeId,
      status: data.status || TaskStatus.BACKLOG
    });

    // Проверка существования проекта
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new Error(`Проект с ID ${projectId} не найден`);
    }

    // Проверка существования пользователя (исполнителя)
    const user = await prisma.user.findUnique({
      where: { id: assigneeId }
    });

    if (!user) {
      throw new Error(`Пользователь с ID ${assigneeId} не найден`);
    }

    // Проверка существования рабочего пространства
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      throw new Error(`Рабочее пространство с ID ${workspaceId} не найден`);
    }

    // Проверка членства пользователя в рабочем пространстве
    const member = await prisma.member.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: assigneeId
        }
      }
    });

    if (!member) {
      throw new Error(`Пользователь ${assigneeId} не является участником рабочего пространства ${workspaceId}`);
    }

    // Находим максимальную позицию для текущего статуса
    const maxPositionTask = await prisma.task.findFirst({
      where: {
        projectId,
        status: data.status || TaskStatus.BACKLOG
      },
      orderBy: {
        position: 'desc'
      }
    });

    const position = maxPositionTask ? maxPositionTask.position + 1 : 0;

    // Создаем задачу
    const task = await prisma.task.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || TaskStatus.BACKLOG,
        dueDate: data.dueDate,
        position,
        assigneeId,
        workspaceId,
        projectId
      }
    });

    return task;
  } catch (error) {
    console.error("Ошибка при создании задачи:", error);
    throw error;
  }
}

export async function getTasksByProjectId(projectId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      projectId
    },
    orderBy: {
      position: 'asc'
    }
  });

  return tasks;
}

export async function getTaskById(taskId: string) {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId
    }
  });

  return task;
}

export async function updateTask(
  taskId: string,
  data: {
    name?: string;
    description?: string;
    status?: TaskStatus;
    position?: number;
    dueDate?: Date;
    assigneeId?: string;
    projectId?: string;
  }
) {
  try {
    // Получаем текущую задачу
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!currentTask) {
      throw new Error(`Задача с ID ${taskId} не найдена`);
    }

    // Если передан assigneeId, проверяем, является ли он участником рабочего пространства
    if (data.assigneeId) {
      const member = await prisma.member.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: currentTask.workspaceId,
            userId: data.assigneeId
          }
        }
      });

      if (!member) {
        throw new Error(`Пользователь ${data.assigneeId} не является участником рабочего пространства ${currentTask.workspaceId}`);
      }
    }

    // Если передан projectId, проверяем, принадлежит ли проект тому же рабочему пространству
    if (data.projectId && data.projectId !== currentTask.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId }
      });

      if (!project) {
        throw new Error(`Проект с ID ${data.projectId} не найден`);
      }

      if (project.workspaceId !== currentTask.workspaceId) {
        throw new Error(`Проект ${data.projectId} не принадлежит рабочему пространству ${currentTask.workspaceId}`);
      }
    }

    // Обновляем задачу
    const task = await prisma.task.update({
      where: { id: taskId },
      data
    });

    return task;
  } catch (error) {
    console.error("Ошибка при обновлении задачи:", error);
    throw error;
  }
}

export async function deleteTask(taskId: string) {
  await prisma.task.delete({
    where: {
      id: taskId
    }
  });
}

// Обновление позиций задач (для drag-and-drop)
export async function reorderTasks(tasks: { id: string; position: number }[]) {
  const updates = tasks.map(({ id, position }) => 
    prisma.task.update({
      where: { id },
      data: { position }
    })
  );
  
  await prisma.$transaction(updates);
} 