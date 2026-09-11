import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  CATEGORY_COLORS,
  PRIORITY_COLORS,
  useApp,
} from "../context/appContext";
import { useTheme } from "../themeContext";
import type { Task } from "../types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function remainingTime(task: Task, now: Date) {
  const remaining =
    timeToMinutes(task.timeEnd) - now.getHours() * 60 - now.getMinutes();
  if (remaining <= 0) return "Done";
  const hours = Math.floor(remaining / 60);
  return hours > 0 ? `${hours}h ${remaining % 60}m left` : `${remaining}m left`;
}

function TaskCard({
  task,
  accent,
  onToggle,
}: {
  task: Task;
  accent: string;
  onToggle: () => void;
}) {
  const { theme } = useTheme();
  const categoryColor =
    task.color || CATEGORY_COLORS[task.category] || theme.mutedText;
  const priorityColor = PRIORITY_COLORS[task.priority] || theme.mutedText;
  return (
    <View
      style={[
        styles.taskCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
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
          <Text style={[styles.checkmark, { color: theme.background }]}>✓</Text>
        )}
      </Pressable>
      <View style={styles.taskCopy}>
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
          <Text style={[styles.taskMeta, { color: theme.mutedText }]}>
            {formatTime(task.timeStart)} - {formatTime(task.timeEnd)}
          </Text>
          {!!task.place && (
            <Text
              numberOfLines={1}
              style={[
                styles.taskMeta,
                styles.place,
                { color: theme.mutedText },
              ]}
            >
              · {task.place}
            </Text>
          )}
        </View>
      </View>
      <Text
        style={[
          styles.badge,
          { backgroundColor: `${categoryColor}22`, color: categoryColor },
        ]}
      >
        {task.category}
      </Text>
    </View>
  );
}

export default function Home() {
  const { tasks, settings, toggleDone, updateSettings } = useApp();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [now, setNow] = useState(new Date());
  const [categoryFilter, setCategoryFilter] = useState("all");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const today = now.toISOString().split("T")[0];
  const tomorrow = new Date(now.getTime() + 86400000)
    .toISOString()
    .split("T")[0];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayTasks = tasks
    .filter((task) => task.date === today)
    .sort((first, second) => first.timeStart.localeCompare(second.timeStart));
  const currentTask = todayTasks.find(
    (task) =>
      nowMinutes >= timeToMinutes(task.timeStart) &&
      nowMinutes <= timeToMinutes(task.timeEnd) &&
      !task.done,
  );
  const nextTask = todayTasks.find(
    (task) => timeToMinutes(task.timeStart) > nowMinutes && !task.done,
  );
  const featuredTask =
    settings.homeMode === "current"
      ? (currentTask ?? nextTask)
      : (nextTask ?? currentTask);
  const featuredTasks = (
    settings.homeMode === "current"
      ? [currentTask, nextTask]
      : [nextTask, currentTask]
  ).filter(
    (task, index, list): task is Task =>
      !!task && list.findIndex((item) => item?.id === task.id) === index,
  );
  const featuredPager = useRef<ScrollView>(null);
  const cardWidth = Math.max(width - 40, 1);
  const upcoming = todayTasks.filter(
    (task) =>
      task.id !== featuredTask?.id &&
      (categoryFilter === "all" || task.category === categoryFilter),
  );
  const tomorrowTasks = tasks
    .filter((task) => task.date === tomorrow)
    .slice(0, 3);
  const accent = settings.accentColor;
  const categories = ["all", "sport", "study", "activity"];

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top, }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.date, { color: theme.mutedText }]}>
          {formatDate(now)}
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
        {featuredTasks.length > 0 ? (
          <View style={styles.featuredPagerWrap}>
            <ScrollView
              ref={featuredPager}
              key={settings.homeMode}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              {featuredTasks.map((task) => {
                const isCurrent = task.id === currentTask?.id;
                return (
                  <View
                    key={task.id}
                    style={[
                      styles.featured,
                      { backgroundColor: accent, width: cardWidth },
                    ]}
                  >
                    <View style={styles.featuredTop}>
                      <View style={styles.featuredCopy}>
                        <Text style={styles.featuredKicker}>
                          {isCurrent ? "NOW" : "UP NEXT"}
                        </Text>
                        <Text numberOfLines={2} style={styles.featuredName}>
                          {task.name}
                        </Text>
                        {!!task.place && (
                          <Text numberOfLines={1} style={styles.featuredPlace}>
                            {task.place}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.featuredTime}>
                        {isCurrent
                          ? remainingTime(task, now)
                          : formatTime(task.timeStart)}
                      </Text>
                    </View>
                    <Text style={styles.featuredMeta}>
                      {formatTime(task.timeStart)} - {formatTime(task.timeEnd)}
                      {task.trailFrom
                        ? ` · ${task.trailFrom} - ${task.trailTo}`
                        : ""}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <View
            style={[
              styles.emptyFeatured,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={{ color: theme.mutedText }}>
              No tasks remaining today
            </Text>
          </View>
        )}
        <View style={[styles.modeToggle, { backgroundColor: theme.surface }]}>
          {(["current", "next"] as const).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => updateSettings({ homeMode: mode })}
              style={[
                styles.modeButton,
                {
                  backgroundColor:
                    settings.homeMode === mode
                      ? theme.tabActive
                      : "transparent",
                },
              ]}
            >
              <Text
                style={{
                  color:
                    settings.homeMode === mode ? theme.text : theme.mutedText,
                  fontWeight: "600",
                }}
              >
                {mode === "current" ? "Show Current" : "Show Next"}
              </Text>
            </Pressable>
          ))}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categories.map((category) => {
            const active = categoryFilter === category;
            const color =
              category === "all" ? accent : CATEGORY_COLORS[category];
            return (
              <Pressable
                key={category}
                onPress={() => setCategoryFilter(category)}
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
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.mutedText }]}>
              TODAY
            </Text>
            {upcoming.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                accent={accent}
                onToggle={() => toggleDone(task.id)}
              />
            ))}
          </View>
        )}
        {tomorrowTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.mutedText }]}>
              TOMORROW
            </Text>
            {tomorrowTasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.tomorrowRow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View
                  style={[
                    styles.tomorrowBar,
                    {
                      backgroundColor:
                        task.color || CATEGORY_COLORS[task.category],
                    },
                  ]}
                />
                <View style={styles.taskCopy}>
                  <Text
                    numberOfLines={1}
                    style={[styles.taskName, { color: theme.text }]}
                  >
                    {task.name}
                  </Text>
                  <Text style={[styles.taskMeta, { color: theme.mutedText }]}>
                    {formatTime(task.timeStart)} · {task.place}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  date: { fontSize: 14, fontWeight: "500", marginBottom: 5 },
  title: { fontSize: 30, fontWeight: "700", marginBottom: 20 },
  featuredPagerWrap: { marginBottom: 18 },
  featured: { borderRadius: 18, marginRight: 0, padding: 18 },
  featuredTop: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  featuredCopy: { flex: 1 },
  featuredKicker: {
    color: "#0a0a0a99",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  featuredName: { color: "#0a0a0a", fontSize: 20, fontWeight: "800" },
  featuredPlace: { color: "#0a0a0acc", fontSize: 12, marginTop: 4 },
  featuredTime: {
    backgroundColor: "#0a0a0a22",
    borderRadius: 7,
    color: "#0a0a0a",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  featuredMeta: { color: "#0a0a0a99", fontSize: 12, marginTop: 16 },
  pagerDots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginTop: 8,
  },
  pagerDot: { borderRadius: 3, height: 5, width: 5 },
  emptyFeatured: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    marginBottom: 18,
    minHeight: 92,
  },
  modeToggle: {
    borderRadius: 10,
    flexDirection: "row",
    gap: 4,
    marginBottom: 16,
    padding: 4,
  },
  modeButton: {
    alignItems: "center",
    borderRadius: 7,
    flex: 1,
    paddingVertical: 10,
  },
  filterRow: { gap: 8, paddingBottom: 18 },
  filter: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  section: { gap: 8, marginBottom: 22 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  taskCard: {
    alignItems: "center",
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  checkbox: {
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 2,
    height: 21,
    justifyContent: "center",
    width: 21,
  },
  checkmark: { fontSize: 13, fontWeight: "800" },
  taskCopy: { flex: 1, gap: 4 },
  inlineRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  priorityDot: { borderRadius: 4, height: 7, width: 7 },
  taskName: { flex: 1, fontSize: 14, fontWeight: "600" },
  taskMeta: { fontSize: 11 },
  place: { flex: 1 },
  badge: {
    borderRadius: 5,
    fontSize: 10,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 6,
    paddingVertical: 4,
    textTransform: "uppercase",
  },
  tomorrowRow: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    opacity: 0.7,
    padding: 12,
  },
  tomorrowBar: { borderRadius: 2, height: 34, width: 4 },
});