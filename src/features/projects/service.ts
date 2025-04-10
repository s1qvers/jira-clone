import { prisma } from "@/lib/prisma";

export async function createProject(workspaceId: string, name: string, imageUrl?: string) {
  const project = await prisma.project.create({
    data: {
      name,
      imageUrl,
      workspaceId
    }
  });

  return project;
}

export async function getProjectsByWorkspaceId(workspaceId: string) {
  const projects = await prisma.project.findMany({
    where: {
      workspaceId
    }
  });

  return projects;
}

export async function getProjectById(projectId: string) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId
    }
  });

  return project;
}

export async function updateProject(projectId: string, data: { name?: string; imageUrl?: string }) {
  const project = await prisma.project.update({
    where: {
      id: projectId
    },
    data
  });

  return project;
}

export async function deleteProject(projectId: string) {
  await prisma.project.delete({
    where: {
      id: projectId
    }
  });
} 