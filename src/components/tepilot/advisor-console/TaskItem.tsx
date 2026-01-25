import { Checkbox } from "@/components/ui/checkbox";
import { Clock } from "lucide-react";
import { Task } from "./sampleData";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const priorityColor =
    task.priority === "high"
      ? "text-red-600"
      : task.priority === "medium"
      ? "text-yellow-600"
      : "text-slate-600";

  return (
    <div className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-slate-50 transition-colors">
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs ${
            task.completed ? "line-through text-slate-400" : "text-slate-900"
          }`}
        >
          {task.title}
        </p>
        {task.dueDate && (
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className={`w-3 h-3 ${priorityColor}`} />
            <span className={`text-xs ${priorityColor}`}>
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
