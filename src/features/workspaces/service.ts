import { prisma } from "@/lib/prisma";

// Генерация случайного инвайт-кода
function generateInviteCode(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export async function createWorkspace(userId: string, name: string, imageUrl?: string) {
  const workspace = await prisma.workspace.create({
    data: {
      name,
      imageUrl,
      inviteCode: generateInviteCode(8),
      userId,
      // Автоматически создаем запись о членстве для создателя как админа
      members: {
        create: {
          userId,
          role: "ADMIN"
        }
      }
    }
  });

  return workspace;
}

export async function getWorkspacesByUserId(userId: string) {
  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId
        }
      }
    }
  });

  return workspaces;
}

export async function getWorkspaceById(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId
    }
  });

  return workspace;
}

export async function updateWorkspace(workspaceId: string, data: { name?: string; imageUrl?: string; inviteCode?: string }) {
  const workspace = await prisma.workspace.update({
    where: {
      id: workspaceId
    },
    data
  });

  return workspace;
}

export async function deleteWorkspace(workspaceId: string) {
  await prisma.workspace.delete({
    where: {
      id: workspaceId
    }
  });
} 