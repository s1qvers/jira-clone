// Тип для рабочего пространства
export type Workspace = {
	id: string;
	$id?: string; // Для совместимости
	name: string;
	imageUrl: string | null;
	inviteCode: string;
	userId: string;
	createdAt?: Date | string;
	updatedAt?: Date | string;
};
