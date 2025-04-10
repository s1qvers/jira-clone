import { Models } from "node-appwrite";
export enum TaskStatus {
	BACKLOG = "BACKLOG",
	TODO = "TODO",
	IN_PROGRESS = "IN_PROGRESS",
	IN_REVIEW = "IN_REVIEW",
	DONE = "DONE",
}

export type PrismaTask = {
	id: string;
	$id?: string; // для совместимости с фронтендом
	name: string;
	status: TaskStatus;
	assigneeId: string;
	workspaceId: string;
	projectId: string;
	position: number;
	dueDate: string | Date;
	description?: string | null;
	createdAt: string | Date;
	updatedAt: string | Date;
	project?: {
		id: string;
		$id?: string;
		name: string;
	} | null;
	assignee?: {
		id: string;
		$id?: string;
		name: string;
		email: string;
	} | null;
};

export type Task = PrismaTask;
