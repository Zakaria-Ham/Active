import { createContext, useContext, useState, type ReactNode } from "react";
import {
  loadSettings,
  loadTasks,
  removeTask,
  saveSettings,
  saveTask,
} from "../data/localDatabase";
import type { AppSettings, Task } from "../types";

interface AppContextType {
  tasks: Task[];
  settings: AppSettings;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleDone: (id: string) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const addTask = (task: Task) => {
    saveTask(task);
    setTasks((p) => [...p, task]);
  };
  const updateTask = (task: Task) => (
    saveTask(task),
    setTasks((p) => p.map((t) => (t.id === task.id ? task : t)))
  );
  const deleteTask = (id: string) => {
    removeTask(id);
    setTasks((p) => p.filter((t) => t.id !== id));
  };
  const toggleDone = (id: string) => {
    setTasks((p) => {
      const next = p.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
      const updated = next.find((task) => task.id === id);
      if (updated) saveTask(updated);
      return next;
    });
  };
  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...partial };
      saveSettings(next);
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        settings,
        addTask,
        updateTask,
        deleteTask,
        toggleDone,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export const CATEGORY_COLORS: Record<string, string> = {
  sport: "#22c55e",
  study: "#3b82f6",
  activity: "#a855f7",
};

export const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#6b7280",
};
