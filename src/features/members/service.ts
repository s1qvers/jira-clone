import { prisma } from "@/lib/prisma";
import { MemberRole } from "./types";

export async function createMember(workspaceId: string, userId: string, role: MemberRole = MemberRole.MEMBER) {
  const member = await prisma.member.create({
    data: {
      workspaceId,
      userId,
      role
    }
  });

  return member;
}

export async function getMembersByWorkspaceId(workspaceId: string) {
  const members = await prisma.member.findMany({
    where: {
      workspaceId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return members;
}

export async function getMemberByWorkspaceAndUserId(workspaceId: string, userId: string) {
  const member = await prisma.member.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId
      }
    }
  });

  return member;
}

export async function updateMemberRole(workspaceId: string, userId: string, role: MemberRole) {
  const member = await prisma.member.update({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId
      }
    },
    data: {
      role
    }
  });

  return member;
}

export async function removeMember(workspaceId: string, userId: string) {
  await prisma.member.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId
      }
    }
  });
} 