import React, { useCallback, useEffect } from "react";
import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
} from "@hello-pangea/dnd";
import { Task, TaskStatus } from "../types";
import { KanbanCard } from "./kanban-card";
import { KanbanColumnHeader } from "./kanban-column-header";

const boards: TaskStatus[] = [
	TaskStatus.BACKLOG,
	TaskStatus.TODO,
	TaskStatus.IN_PROGRESS,
	TaskStatus.IN_REVIEW,
	TaskStatus.DONE,
];

type TaskState = {
	[key in TaskStatus]: Task[];
};
interface DataKanbanProps {
	data: Task[];
	onChange: (
		tasks: {
			$id: string;
			status: TaskStatus;
			position: number;
		}[]
	) => void;
	onTaskClick?: (task: Task) => void;
}

export const DataKanban = ({ data, onChange, onTaskClick }: DataKanbanProps) => {
	const [tasks, setTasks] = React.useState<TaskState>(() => {
		const initialTasks: TaskState = {
			[TaskStatus.BACKLOG]: [],
			[TaskStatus.TODO]: [],
			[TaskStatus.IN_PROGRESS]: [],
			[TaskStatus.IN_REVIEW]: [],
			[TaskStatus.DONE]: [],
		};

		data.forEach((task) => {
			initialTasks[task.status].push(task);
		});

		Object.keys(initialTasks).forEach((key) => {
			initialTasks[key as TaskStatus].sort((a, b) => a.position - b.position);
		});

		return initialTasks;
	});

	useEffect(() => {
		const newTasks: TaskState = {
			[TaskStatus.BACKLOG]: [],
			[TaskStatus.TODO]: [],
			[TaskStatus.IN_PROGRESS]: [],
			[TaskStatus.IN_REVIEW]: [],
			[TaskStatus.DONE]: [],
		};

		data.forEach((task) => {
			newTasks[task.status].push(task);
		});

		Object.keys(newTasks).forEach((key) => {
			newTasks[key as TaskStatus].sort((a, b) => a.position - b.position);
		});

		setTasks(newTasks);
	}, [data]);

	const onDragEnd = useCallback(
		(result: DropResult) => {
			if (!result.destination) return;
			const { source, destination } = result;
			const sourceStatus = source.droppableId as TaskStatus;
			const destinationStatus = destination.droppableId as TaskStatus;

			let updatesPayload: {
				$id: string;
				status: TaskStatus;
				position: number;
			}[] = [];

			setTasks((prev) => {
				const newTasks = { ...prev };
				// Safely remove task from source column
				const sourceTasks = [...newTasks[sourceStatus]];
				const [movedTask] = sourceTasks.splice(source.index, 1);

				// If there is no moved task, return the previous state
				if (!movedTask) {
					console.error("No task found in source index");
					return prev;
				}

				// Create a new task object with potentiallu updated status
				const updatedTask =
					sourceStatus !== destinationStatus
						? { ...movedTask, status: destinationStatus }
						: movedTask;

				// Updating the source column
				newTasks[sourceStatus] = sourceTasks;

				// Add the updated task to the destination column
				const destinationColumn = [...newTasks[destinationStatus]];
				destinationColumn.splice(destination.index, 0, updatedTask);
				newTasks[destinationStatus] = destinationColumn;

				// Prepare minimal update payload
				updatesPayload = [];

				// Always update the the moved task
				updatesPayload.push({
					$id: movedTask.$id || movedTask.id,
					status: destinationStatus,
					position: Math.min((destination.index + 1) * 1000, 1_000_000),
				});

				// Update the positions for affected tasks in the destination column
				newTasks[destinationStatus].forEach((task, index) => {
					if (task && task.$id !== updatedTask.$id) {
						const newPosition = Math.min((index + 1) * 1000, 1_000_000);
						if (task.position !== newPosition) {
							updatesPayload.push({
								$id: task.$id || task.id,
								status: destinationStatus,
								position: newPosition,
							});
						}
					}
				});

				// If  the task moved between columns, update position in the soure column
				if (sourceStatus !== destinationStatus) {
					newTasks[sourceStatus].forEach((task, index) => {
						if (task) {
							const newPosition = Math.min((index + 1) * 1000, 1_000_000);
							if (task.position !== newPosition) {
								updatesPayload.push({
									$id: task.$id || task.id,
									status: sourceStatus,
									position: newPosition,
								});
							}
						}
					});
				}

				return newTasks;
			});
			onChange(updatesPayload);
		},
		[onChange]
	);

	const handleTaskClick = (task: Task) => {
		if (onTaskClick) {
			onTaskClick(task);
		}
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
				{boards.map((status) => (
					<Droppable droppableId={status} key={status}>
						{(provided) => (
							<div
								className="bg-neutral-100 rounded-md shadow-sm"
								{...provided.droppableProps}
								ref={provided.innerRef}
							>
								<KanbanColumnHeader
									board={status}
									taskCount={data?.filter((task) => task.status === status).length || 0}
								/>

								<div className="p-2">
									{data
										?.filter((task) => task.status === status)
										.sort((a, b) => a.position - b.position)
										.map((task, index) => (
											<Draggable
												draggableId={task.id}
												index={index}
												key={task.id}
											>
												{(provided) => (
													<div
														className="mb-2 hover:translate-y-[-3px] hover:shadow-md transition hover:scale-[1.03] active:scale-[1.01]"
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														onClick={() => handleTaskClick(task)}
													>
														<KanbanCard task={task} />
													</div>
												)}
											</Draggable>
										))}
									{provided.placeholder}
								</div>
							</div>
						)}
					</Droppable>
				))}
			</div>
		</DragDropContext>
	);
};
