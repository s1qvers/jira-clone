export enum MemberRole {
	ADMIN = "ADMIN",
	MEMBER = "MEMBER",
}

interface UserInfo {
	id: string;
	name: string;
	email: string;
}

export interface MemberWithUser {
	id: string;
	$id?: string;
	workspaceId: string;
	userId: string;
	role: MemberRole;
	user: UserInfo;
	name: string;
	email: string;
	createdAt: string | Date;
	updatedAt: string | Date;
}

export type PrismaMember = {
	id: string;
	$id?: string; // для совместимости с фронтендом
	workspaceId: string;
	userId: string;
	role: MemberRole;
	createdAt: string | Date;
	updatedAt: string | Date;
	name?: string;
	email?: string;
};

export type Member = PrismaMember;