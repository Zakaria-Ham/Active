import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AddTaskModal from "../../components/addTaskModel";
import {
  CATEGORY_COLORS,
  PRIORITY_COLORS,
  useApp,
} from "../../context/appContext";
import { useTheme } from "../../themeContext";
import type { Category, Task } from "../../types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function formatDateLabel(value: string) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (value === today) return "Today";
  if (value === tomorrow) return "Tomorrow";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

interface TaskItemProps {
  task: Task;
  accent: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function TaskItem({ task, accent, onToggle, onEdit, onDelete }: TaskItemProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const categoryColor = CATEGORY_COLORS[task.category] ?? theme.mutedText;
  const priorityColor = PRIORITY_COLORS[task.priority] ?? theme.mutedText;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.cardRow}>
        <View style={[styles.accentBar, { backgroundColor: categoryColor }]} />
        <View style={styles.cardContent}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.done }}
            onPress={onToggle}
            style={[
              styles.checkbox,
              {
                borderColor: task.done ? accent : theme.border,
                backgroundColor: task.done ? accent : "transparent",
              },
            ]}
          >
            {task.done && (
              <Text style={[styles.checkmark, { color: theme.background }]}>
                ✓
              </Text>
            )}
          </Pressable>
          <View style={styles.taskText}>
            <View style={styles.inlineRow}>
              <View
                style={[styles.priorityDot, { backgroundColor: priorityColor }]}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.taskName,
                  {
                    color: task.done ? theme.mutedText : theme.text,
                    textDecorationLine: task.done ? "line-through" : "none",
                  },
                ]}
              >
                {task.name}
              </Text>
            </View>
            <View style={styles.inlineRow}>
              <Text style={[styles.smallText, { color: theme.mutedText }]}>
                {formatTime(task.timeStart)} - {formatTime(task.timeEnd)}
              </Text>
              {!!task.place && (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.smallText,
                    styles.place,
                    { color: theme.mutedText },
                  ]}
                >
                  · {task.place}
                </Text>
              )}
            </View>
            {task.category === "sport" && task.sportType && (
              <View style={styles.inlineRow}>
                <Text
                  style={[
                    styles.tag,
                    {
                      backgroundColor: `${categoryColor}22`,
                      color: categoryColor,
                    },
                  ]}
                >
                  {task.sportType === "custom"
                    ? task.sportCustomName
                    : task.sportType}
                </Text>
                {task.sportType !== "football" && task.trailFrom && (
                  <Text
                    numberOfLines={1}
                    style={[styles.smallText, { color: theme.mutedText }]}
                  >
                    {task.trailFrom} - {task.trailTo}
                  </Text>
                )}
              </View>
            )}
            {task.category === "study" && task.studyType && (
              <Text
                style={[
                  styles.tag,
                  {
                    backgroundColor: `${categoryColor}22`,
                    color: categoryColor,
                  },
                ]}
              >
                {task.studyType}
              </Text>
            )}
          </View>
          <Pressable
            accessibilityLabel="Task actions"
            onPress={() => setOpen((value) => !value)}
            style={[
              styles.moreButton,
              { backgroundColor: open ? theme.tabActive : "transparent" },
            ]}
          >
            <Text style={[styles.moreText, { color: theme.mutedText }]}>
              •••
            </Text>
          </Pressable>
        </View>
      </View>
      {open && (
        <View style={[styles.actions, { borderTopColor: theme.border }]}>
          <Pressable
            onPress={() => {
              onEdit();
              setOpen(false);
            }}
            style={styles.actionButton}
          >
            <Text style={{ color: theme.mutedText }}>Edit</Text>
          </Pressable>
          <View
            style={[styles.actionDivider, { backgroundColor: theme.border }]}
          />
          <Pressable
            onPress={() => {
              onDelete();
              setOpen(false);
            }}
            style={styles.actionButton}
          >
            <Text style={{ color: "#ef4444" }}>Delete</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function Tasks() {
  const { tasks, settings, toggleDone, deleteTask } = useApp();
  const { theme } = useTheme();
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [sortBy, setSortBy] = useState<"time" | "priority" | "name">("time");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const accent = settings.accentColor;
  const insets = useSafeAreaInsets()
  const filteredTasks = tasks
    .filter(
      (task) => categoryFilter === "all" || task.category === categoryFilter,
    )
    .sort((first, second) => {
      if (sortBy === "priority")
        return priorityOrder[first.priority] - priorityOrder[second.priority];
      if (sortBy === "name") return first.name.localeCompare(second.name);
      return (
        first.date.localeCompare(second.date) ||
        first.timeStart.localeCompare(second.timeStart)
      );
    });
  const grouped = filteredTasks.reduce<Record<string, Task[]>>(
    (result, task) => {
      (result[task.date] ??= []).push(task);
      return result;
    },
    {},
  );
  const dates = Object.keys(grouped).sort();
  const categories: { id: Category | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "sport", label: "Sport" },
    { id: "study", label: "Study" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top}, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: theme.text }]}>Tasks</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categories.map(({ id, label }) => {
            const active = categoryFilter === id;
            const color = id === "all" ? accent : CATEGORY_COLORS[id];
            return (
              <Pressable
                key={id}
                onPress={() => setCategoryFilter(id)}
                style={[
                  styles.filter,
                  {
                    backgroundColor: active ? `${color}22` : theme.surface,
                    borderColor: active ? color : theme.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? color : theme.mutedText,
                    fontWeight: "600",
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.sortRow}>
          <Text style={[styles.smallText, { color: theme.mutedText }]}>
            Sort:
          </Text>
          {(["time", "priority", "name"] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => setSortBy(value)}
              style={[
                styles.sortButton,
                {
                  backgroundColor:
                    sortBy === value ? theme.tabActive : "transparent",
                },
              ]}
            >
              <Text
                style={{
                  color: sortBy === value ? theme.text : theme.mutedText,
                }}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
        {dates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ color: theme.mutedText }}>No tasks yet</Text>
            <Text style={[styles.smallText, { color: theme.mutedText }]}>
              Tap + to add your first task
            </Text>
          </View>
        ) : (
          dates.map((date) => (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <Text style={[styles.dateLabel, { color: theme.mutedText }]}>
                  {formatDateLabel(date)}
                </Text>
                <Text
                  style={[
                    styles.count,
                    { backgroundColor: theme.surface, color: theme.mutedText },
                  ]}
                >
                  {grouped[date].length}
                </Text>
              </View>
              {grouped[date].map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  accent={accent}
                  onToggle={() => toggleDone(task.id)}
                  onEdit={() => {
                    setEditTask(task);
                    setShowModal(true);
                  }}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
      {showModal && (
        <AddTaskModal
          onClose={() => {
            setShowModal(false);
            setEditTask(null);
          }}
          editTask={editTask}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  heading: { fontSize: 28, fontWeight: "700", marginBottom: 18 },
  filterRow: { gap: 8, paddingBottom: 14 },
  filter: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sortRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  sortButton: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  dateGroup: { gap: 8, marginBottom: 20 },
  dateHeader: { alignItems: "center", flexDirection: "row", gap: 10 },
  dateLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  count: {
    borderRadius: 12,
    fontSize: 12,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  cardRow: { flexDirection: "row" },
  accentBar: { width: 4 },
  cardContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  checkbox: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  checkmark: { fontSize: 14, fontWeight: "700" },
  taskText: { flex: 1, gap: 4 },
  inlineRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  priorityDot: { borderRadius: 4, height: 7, width: 7 },
  taskName: { flex: 1, fontSize: 15, fontWeight: "600" },
  smallText: { fontSize: 12 },
  place: { flex: 1 },
  tag: {
    alignSelf: "flex-start",
    borderRadius: 4,
    fontSize: 10,
    overflow: "hidden",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  moreButton: {
    alignItems: "center",
    borderRadius: 18,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  moreText: { fontSize: 16, letterSpacing: 1 },
  actions: { borderTopWidth: 1, flexDirection: "row", padding: 4 },
  actionButton: { alignItems: "center", flex: 1, padding: 12 },
  actionDivider: { marginVertical: 8, width: 1 },
  emptyState: { alignItems: "center", gap: 8, paddingVertical: 80 },
});
