import React from "react";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useGetMembers } from "@/features/members/api/use-get-members";

interface DashboardTopbarProps {
  members: ReturnType<typeof useGetMembers>["data"];
  tasks: ReturnType<typeof useGetTasks>["data"];
  projects: ReturnType<typeof useGetProjects>["data"];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  workspaceId: string;
}

export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  members,
  tasks,
  projects,
  sidebarOpen,
  setSidebarOpen,
  workspaceId
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <button 
        className="p-2 rounded-md hover:bg-gray-100"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? 'Скрыть меню' : 'Показать меню'}
      </button>
      <div className="flex items-center space-x-4">
        <div>Проекты: {projects?.total || 0}</div>
        <div>Задачи: {tasks?.total || 0}</div>
        <div>Участники: {members?.total || 0}</div>
      </div>
    </div>
  );
}; 