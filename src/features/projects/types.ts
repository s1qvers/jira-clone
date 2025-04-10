import { Models } from "node-appwrite";

export type PrismaProject = {
	id: string;
	$id?: string; // для совместимости с фронтендом
	name: string;
	imageUrl: string | null;
	workspaceId: string;
	createdAt: string | Date;
	updatedAt: string | Date;
};

export type Project = PrismaProject;
