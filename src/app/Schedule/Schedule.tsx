import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CATEGORY_COLORS, useApp } from "../../context/appContext";
import { useTheme } from "../../themeContext";
import type { Task } from "../../types";

type ViewMode = "day" | "week" | "month";
const HOURS = Array.from({ length: 18 }, (_, index) => index + 5);
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toDateString(date: Date) {
  return date.toISOString().split("T")[0];
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

function weekNumber(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear =
    Math.floor((date.getTime() - firstDayOfYear.getTime()) / 86400000) + 1;
  return Math.ceil((dayOfYear + firstDayOfYear.getDay()) / 7);
}

function monthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  return [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1),
  ];
}

function ArrowButton({
  direction,
  onPress,
}: {
  direction: "left" | "right";
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityLabel={direction === "left" ? "Previous" : "Next"}
      onPress={onPress}
      style={[styles.arrowButton, { backgroundColor: theme.surface }]}
    >
      <Text style={[styles.arrow, { color: theme.text }]}>
        {direction === "left" ? "<" : ">"}
      </Text>
    </Pressable>
  );
}

function TaskCard({
  task,
  onPress,
  compact = false,
}: {
  task: Task;
  onPress: () => void;
  compact?: boolean;
}) {
  const color = CATEGORY_COLORS[task.category];
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        compact ? styles.compactTask : styles.taskCard,
        {
          backgroundColor: `${color}22`,
          borderColor: `${color}66`,
          opacity: task.done ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.taskHeader}>
        <Text
          numberOfLines={1}
          style={[
            compact ? styles.compactTaskName : styles.taskName,
            { color },
          ]}
        >
          {task.name}
        </Text>
        <Text style={[styles.taskTime, { color: theme.mutedText }]}>
          {task.timeStart}
          {!compact && `-${task.timeEnd}`}
        </Text>
      </View>
      {!compact && !!task.place && (
        <Text
          numberOfLines={1}
          style={[styles.place, { color: theme.mutedText }]}
        >
          {task.place}
        </Text>
      )}
    </Pressable>
  );
}

function TaskDetails({ task, onClose }: { task: Task; onClose: () => void }) {
  const { theme } = useTheme();
  const color = CATEGORY_COLORS[task.category];
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={[
            styles.details,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <View style={styles.detailsHeader}>
            <View style={[styles.categoryDot, { backgroundColor: color }]} />
            <View style={styles.detailsTitle}>
              <Text style={[styles.detailsName, { color: theme.text }]}>
                {task.name}
              </Text>
              <Text style={[styles.place, { color: theme.mutedText }]}>
                {formatTime(task.timeStart)} - {formatTime(task.timeEnd)}
                {task.place ? ` - ${task.place}` : ""}
              </Text>
            </View>
            <Text
              style={[
                styles.category,
                { backgroundColor: `${color}22`, color },
              ]}
            >
              {task.category}
            </Text>
          </View>
          {!!task.description && (
            <Text style={[styles.description, { color: theme.mutedText }]}>
              {task.description}
            </Text>
          )}
          {task.category === "sport" &&
            task.sportType !== "football" &&
            task.trailFrom && (
              <View style={styles.detailRow}>
                <Text style={[styles.place, { color: theme.mutedText }]}>
                  Trail:
                </Text>
                <Text style={{ color: theme.text }}>
                  {task.trailFrom} - {task.trailTo}
                </Text>
              </View>
            )}
          {task.category === "study" && task.studyType && (
            <View style={styles.detailRow}>
              <Text style={[styles.place, { color: theme.mutedText }]}>
                Level:
              </Text>
              <Text style={{ color: theme.text }}>{task.studyType}</Text>
            </View>
          )}
          <Pressable
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: theme.tabActive }]}
          >
            <Text style={{ color: theme.mutedText, fontWeight: "600" }}>
              Close
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function Schedule() {
  const { tasks, settings } = useApp();
  const { theme } = useTheme();
  const [view, setView] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  const [weekExpanded, setWeekExpanded] = useState(false);
  const [expandedTask, setExpandedTask] = useState<Task | null>(null);
  const accent = settings.accentColor;
  const today = toDateString(new Date());
  const selected = toDateString(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(selectedDate, index - 3),
  );
  const selectedWeekStart = startOfWeek(selectedDate);
  const selectedWeekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(selectedWeekStart, index),
  );
  const getTasks = (date: string) =>
    tasks
      .filter((task) => task.date === date)
      .sort((first, second) => first.timeStart.localeCompare(second.timeStart));
  const dayTasks = getTasks(selected);
  const now = new Date();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.navigation}>
          <ArrowButton
            direction="left"
            onPress={() => setSelectedDate((date) => addDays(date, -1))}
          />
          <View style={styles.centerHeader}>
            <Text style={[styles.monthTitle, { color: theme.text }]}>
              {selectedDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <Text style={[styles.place, { color: theme.mutedText }]}>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <ArrowButton
            direction="right"
            onPress={() => setSelectedDate((date) => addDays(date, 1))}
          />
        </View>
        <View style={[styles.viewToggle, { backgroundColor: theme.surface }]}>
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setView(mode)}
              style={[
                styles.viewButton,
                {
                  backgroundColor:
                    view === mode ? theme.tabActive : "transparent",
                },
              ]}
            >
              <Text
                style={{
                  color: view === mode ? theme.text : theme.mutedText,
                  fontWeight: "600",
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
        {view === "day" && (
          <View style={styles.weekStrip}>
            {weekDays.map((date) => {
              const dateString = toDateString(date);
              const active = dateString === selected;
              const isToday = dateString === today;
              return (
                <Pressable
                  key={dateString}
                  onPress={() => setSelectedDate(date)}
                  style={[
                    styles.weekDay,
                    {
                      backgroundColor: active
                        ? accent
                        : isToday
                          ? theme.surface
                          : "transparent",
                      borderColor:
                        isToday && !active ? `${accent}66` : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? theme.background : theme.mutedText,
                      fontSize: 11,
                    }}
                  >
                    {date
                      .toLocaleDateString("en-US", { weekday: "short" })
                      .slice(0, 2)}
                  </Text>
                  <Text
                    style={{
                      color: active
                        ? theme.background
                        : isToday
                          ? accent
                          : theme.text,
                      fontWeight: "700",
                    }}
                  >
                    {date.getDate()}
                  </Text>
                  {getTasks(dateString).length > 0 && (
                    <View
                      style={[
                        styles.taskDot,
                        { backgroundColor: active ? theme.background : accent },
                      ]}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
        {view === "week" && (
          <View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Week ${weekNumber(selectedWeekStart)}`}
              onPress={() => setWeekExpanded((expanded) => !expanded)}
              style={[
                styles.weekSummary,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View>
                <Text style={[styles.weekSummaryLabel, { color: accent }]}>
                  WEEK {weekNumber(selectedWeekStart)}
                </Text>
                <Text style={[styles.weekSummaryRange, { color: theme.text }]}>
                  {selectedWeekStart.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {addDays(selectedWeekStart, 6).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <View style={styles.weekSummaryMeta}>
                <Text style={[styles.weekTaskCount, { color: theme.text }]}>
                  {selectedWeekDays.reduce(
                    (total, date) =>
                      total + getTasks(toDateString(date)).length,
                    0,
                  )}
                </Text>
                <Text
                  style={[styles.weekTaskLabel, { color: theme.mutedText }]}
                >
                  tasks
                </Text>
                <Text style={[styles.weekChevron, { color: theme.mutedText }]}>
                  {weekExpanded ? "−" : "+"}
                </Text>
              </View>
            </Pressable>
            {weekExpanded && (
              <View
                style={[styles.expandedWeek, { borderColor: theme.border }]}
              >
                {selectedWeekDays.map((date) => {
                  const dateString = toDateString(date);
                  const dateTasks = getTasks(dateString);
                  const isToday = dateString === today;
                  return (
                    <Pressable
                      key={dateString}
                      onPress={() => setSelectedDate(date)}
                      style={[
                        styles.expandedDay,
                        {
                          backgroundColor:
                            dateString === selected
                              ? theme.tabActive
                              : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.expandedDayName,
                          { color: isToday ? accent : theme.mutedText },
                        ]}
                      >
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </Text>
                      <Text
                        style={[
                          styles.expandedDayNumber,
                          { color: isToday ? accent : theme.text },
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                      <Text
                        style={[
                          styles.expandedDayCount,
                          {
                            color: dateTasks.length
                              ? theme.text
                              : theme.mutedText,
                          },
                        ]}
                      >
                        {dateTasks.length}
                      </Text>
                      <View style={styles.expandedDots}>
                        {dateTasks.map((task) => (
                          <View
                            key={task.id}
                            style={[
                              styles.taskDot,
                              {
                                backgroundColor:
                                  task.color || CATEGORY_COLORS[task.category],
                              },
                            ]}
                          />
                        ))}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        {view === "day" && (
          <View>
            {HOURS.map((hour) => {
              const hourTasks = dayTasks.filter(
                (task) =>
                  Math.floor(timeToMinutes(task.timeStart) / 60) === hour,
              );
              const currentHour = selected === today && now.getHours() === hour;
              return (
                <View key={hour} style={styles.hourRow}>
                  <View style={styles.hourLabel}>
                    <Text
                      style={{
                        color: currentHour ? accent : theme.mutedText,
                        fontSize: 10,
                      }}
                    >{`${hour % 12 || 12}${hour >= 12 ? "PM" : "AM"}`}</Text>
                  </View>
                  <View
                    style={[
                      styles.hourContent,
                      { borderTopColor: theme.border },
                    ]}
                  >
                    {currentHour && (
                      <View
                        style={[
                          styles.nowLine,
                          {
                            top: `${(now.getMinutes() / 60) * 100}%`,
                            backgroundColor: accent,
                          },
                        ]}
                      />
                    )}
                    {hourTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onPress={() => setExpandedTask(task)}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        {view === "week" && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.weekGrid}>
              {selectedWeekDays.map((date) => {
                const dateString = toDateString(date);
                return (
                  <View key={dateString} style={styles.weekColumn}>
                    {getTasks(dateString).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        compact
                        onPress={() => setExpandedTask(task)}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
        {view === "month" && (
          <View>
            <View style={styles.monthNavigation}>
              <ArrowButton
                direction="left"
                onPress={() =>
                  setSelectedMonth((month) => {
                    const date = new Date(month.year, month.month - 1);
                    return { year: date.getFullYear(), month: date.getMonth() };
                  })
                }
              />
              <Text style={[styles.monthLabel, { color: theme.text }]}>
                {new Date(
                  selectedMonth.year,
                  selectedMonth.month,
                ).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <ArrowButton
                direction="right"
                onPress={() =>
                  setSelectedMonth((month) => {
                    const date = new Date(month.year, month.month + 1);
                    return { year: date.getFullYear(), month: date.getMonth() };
                  })
                }
              />
            </View>
            <View style={styles.calendarGrid}>
              {WEEKDAYS.map((day) => (
                <Text
                  key={day}
                  style={[styles.calendarWeekday, { color: theme.mutedText }]}
                >
                  {day}
                </Text>
              ))}
              {monthDays(selectedMonth.year, selectedMonth.month).map(
                (day, index) => {
                  if (!day)
                    return (
                      <View
                        key={`empty-${index}`}
                        style={styles.calendarCell}
                      />
                    );
                  const dateString = `${selectedMonth.year}-${String(selectedMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isToday = dateString === today;
                  const isSelected = dateString === selected;
                  const dateTasks = getTasks(dateString);
                  return (
                    <Pressable
                      key={dateString}
                      onPress={() => {
                        setSelectedDate(
                          new Date(
                            selectedMonth.year,
                            selectedMonth.month,
                            day,
                          ),
                        );
                        setView("day");
                      }}
                      style={[
                        styles.calendarCell,
                        {
                          backgroundColor: isSelected
                            ? accent
                            : isToday
                              ? `${accent}22`
                              : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isSelected
                            ? theme.background
                            : isToday
                              ? accent
                              : theme.text,
                          fontWeight: "600",
                        }}
                      >
                        {day}
                      </Text>
                      <View style={styles.dotRow}>
                        {dateTasks.slice(0, 3).map((task) => (
                          <View
                            key={task.id}
                            style={[
                              styles.taskDot,
                              {
                                backgroundColor: isSelected
                                  ? theme.background
                                  : CATEGORY_COLORS[task.category],
                              },
                            ]}
                          />
                        ))}
                      </View>
                    </Pressable>
                  );
                },
              )}
            </View>
          </View>
        )}
      </ScrollView>
      {expandedTask && (
        <TaskDetails
          task={expandedTask}
          onClose={() => setExpandedTask(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  navigation: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  centerHeader: { alignItems: "center" },
  monthTitle: { fontSize: 17, fontWeight: "700" },
  arrowButton: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  arrow: { fontSize: 22, fontWeight: "500" },
  viewToggle: {
    borderRadius: 12,
    flexDirection: "row",
    gap: 4,
    marginBottom: 14,
    padding: 4,
  },
  viewButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 9,
  },
  weekStrip: { flexDirection: "row", gap: 4 },
  weekDay: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: 5,
    paddingVertical: 9,
  },
  taskDot: { borderRadius: 3, height: 5, width: 5 },
  weekSummary: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  weekSummaryLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  weekSummaryRange: { fontSize: 14, fontWeight: "600", marginTop: 3 },
  weekSummaryMeta: { alignItems: "center", flexDirection: "row", gap: 5 },
  weekTaskCount: { fontSize: 18, fontWeight: "700" },
  weekTaskLabel: { fontSize: 10, marginRight: 8 },
  weekChevron: { fontSize: 22, fontWeight: "300" },
  expandedWeek: {
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    flexDirection: "row",
    padding: 5,
  },
  expandedDay: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    minHeight: 78,
    paddingVertical: 7,
  },
  expandedDayName: { fontSize: 10, fontWeight: "600" },
  expandedDayNumber: { fontSize: 17, fontWeight: "700", marginTop: 3 },
  expandedDayCount: { fontSize: 10, marginTop: 4 },
  expandedDots: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    justifyContent: "center",
    marginTop: 4,
    maxWidth: 34,
  },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 20, paddingBottom: 24 },
  hourRow: { flexDirection: "row", minHeight: 64 },
  hourLabel: { paddingTop: 9, width: 44 },
  hourContent: {
    borderTopWidth: 1,
    flex: 1,
    gap: 6,
    minHeight: 64,
    paddingVertical: 8,
    position: "relative",
  },
  nowLine: { height: 2, left: 0, position: "absolute", right: 0, zIndex: 2 },
  taskCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  taskHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  taskName: { flex: 1, fontSize: 14, fontWeight: "700" },
  taskTime: { fontSize: 10 },
  place: { fontSize: 12, marginTop: 3 },
  weekGrid: { flexDirection: "row", gap: 8, minWidth: 480 },
  weekColumn: { flex: 1, gap: 6, minWidth: 60 },
  weekColumnHeader: {
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 8,
  },
  compactTask: { borderRadius: 8, borderWidth: 1, padding: 7 },
  compactTaskName: { fontSize: 10, fontWeight: "700" },
  monthNavigation: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthLabel: { fontSize: 15, fontWeight: "700" },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  calendarWeekday: {
    fontSize: 10,
    paddingVertical: 6,
    textAlign: "center",
    width: "13.5%",
  },
  calendarCell: {
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: "center",
    width: "13.5%",
  },
  dotRow: { flexDirection: "row", gap: 2, marginTop: 4 },
  overlay: {
    backgroundColor: "#00000088",
    flex: 1,
    justifyContent: "flex-end",
  },
  details: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  handle: {
    alignSelf: "center",
    borderRadius: 3,
    height: 5,
    marginBottom: 18,
    width: 40,
  },
  detailsHeader: { alignItems: "flex-start", flexDirection: "row", gap: 10 },
  categoryDot: { borderRadius: 6, height: 12, marginTop: 4, width: 12 },
  detailsTitle: { flex: 1 },
  detailsName: { fontSize: 19, fontWeight: "700" },
  category: {
    borderRadius: 14,
    fontSize: 11,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  description: { fontSize: 14, lineHeight: 21, marginVertical: 18 },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  closeButton: {
    alignItems: "center",
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 14,
  },
});
