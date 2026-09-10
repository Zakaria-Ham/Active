import * as Location from "expo-location";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    CATEGORY_COLORS,
    PRIORITY_COLORS,
    useApp,
} from "../context/appContext";
import { useTheme } from "../themeContext";
import type { Category, Priority, SportType, StudyType, Task } from "../types";

interface Props {
  onClose: () => void;
  editTask?: Task | null;
  initialPlace?: string;
  initialCoordinates?: { latitude: number; longitude: number };
}

const SPORT_TYPES: { id: SportType; label: string; hasTrail: boolean }[] = [
  { id: "swim", label: "Swim", hasTrail: true },
  { id: "run", label: "Run", hasTrail: true },
  { id: "football", label: "Football", hasTrail: false },
  { id: "gym", label: "Gym", hasTrail: true },
  { id: "hike", label: "Hike", hasTrail: true },
  { id: "custom", label: "Custom", hasTrail: true },
];

const STUDY_TYPES: { id: StudyType; label: string }[] = [
  { id: "uni", label: "University" },
  { id: "personal", label: "Personal" },
];

const TASK_COLORS = [
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
];

function isHexColor(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function uid() {
  return Math.random().toString(36).slice(2);
}

function randomCoord() {
  return Math.random() * 0.8 + 0.1;
}

const LOCAL_PLACE_WORDS = new Set([
  "here",
  "hna",
  "desktop",
  "bureau",
  "home",
  "maison",
  "dar",
  "work",
  "office",
  "pitch",
  "stadium",
]);

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
}: FieldProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: theme.mutedText }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedText}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
      />
    </View>
  );
}

export default function AddTaskModal({
  onClose,
  editTask,
  initialPlace = "",
  initialCoordinates,
}: Props) {
  const { addTask, updateTask, settings } = useApp();
  const { theme } = useTheme();
  const accent = settings.accentColor;
  const [name, setName] = useState(editTask?.name ?? "");
  const [description, setDescription] = useState(editTask?.description ?? "");
  const [date, setDate] = useState(
    editTask?.date ?? new Date().toISOString().split("T")[0],
  );
  const [place, setPlace] = useState(editTask?.place ?? initialPlace);
  const [resolvedPlace, setResolvedPlace] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    editTask
      ? { latitude: editTask.lat, longitude: editTask.lng }
      : (initialCoordinates ?? null),
  );
  const [placeStatus, setPlaceStatus] = useState("");
  const [timeStart, setTimeStart] = useState(editTask?.timeStart ?? "09:00");
  const [timeEnd, setTimeEnd] = useState(editTask?.timeEnd ?? "10:00");
  const [category, setCategory] = useState<Category>(
    editTask?.category ?? "activity",
  );
  const [sportType, setSportType] = useState<SportType>(
    editTask?.sportType ?? "run",
  );
  const [sportCustomName, setSportCustomName] = useState(
    editTask?.sportCustomName ?? "",
  );
  const [trailFrom, setTrailFrom] = useState(editTask?.trailFrom ?? "");
  const [trailTo, setTrailTo] = useState(editTask?.trailTo ?? "");
  const [studyType, setStudyType] = useState<StudyType>(
    editTask?.studyType ?? "uni",
  );
  const [priority, setPriority] = useState<Priority>(
    editTask?.priority ?? "medium",
  );
  const [color, setColor] = useState(
    editTask?.color ?? CATEGORY_COLORS.activity,
  );
  const [customColor, setCustomColor] = useState(
    editTask?.color && !TASK_COLORS.includes(editTask.color)
      ? editTask.color
      : "#8b5cf6",
  );
  const [showCustomColor, setShowCustomColor] = useState(
    !!editTask?.color && !TASK_COLORS.includes(editTask.color),
  );
  const activeSport = SPORT_TYPES.find((item) => item.id === sportType);

  async function resolvePlace() {
    const query = place.trim().toLowerCase();
    try {
      if (LOCAL_PLACE_WORDS.has(query)) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted")
          throw new Error("Location permission was denied");
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const isHome = ["desktop", "bureau", "home", "maison", "dar"].includes(
          query,
        );
        const isWork = ["work", "office"].includes(query);
        const isPitch = ["pitch", "stadium"].includes(query);
        const savedLocation = isHome
          ? {
              latitude: settings.homeLatitude,
              longitude: settings.homeLongitude,
            }
          : isWork
            ? {
                latitude: settings.workLatitude,
                longitude: settings.workLongitude,
              }
            : {
                latitude: settings.pitchLatitude,
                longitude: settings.pitchLongitude,
              };
        if (
          (isHome || isWork || isPitch) &&
          savedLocation.latitude !== undefined &&
          savedLocation.longitude !== undefined
        ) {
          setResolvedPlace({
            latitude: savedLocation.latitude,
            longitude: savedLocation.longitude,
          });
          setPlaceStatus(
            `Using saved ${isHome ? "home" : isWork ? "work" : "pitch"} location`,
          );
        } else {
          setResolvedPlace({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
          setPlaceStatus(
            isHome || isWork || isPitch
              ? "Saved location is not set; using your current location"
              : "Using your current location",
          );
        }
        return;
      }
      const results = await Location.geocodeAsync(place.trim());
      if (!results[0]) throw new Error("Place not found");
      setResolvedPlace({
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      });
      setPlaceStatus("Location found");
    } catch (error) {
      setPlaceStatus(
        error instanceof Error ? error.message : "Could not find this place",
      );
    }
  }

  function handleSubmit() {
    if (!name.trim()) return;
    const task: Task = {
      id: editTask?.id ?? uid(),
      name: name.trim(),
      description: description.trim(),
      date,
      place: place.trim(),
      timeStart,
      timeEnd,
      category,
      sportType: category === "sport" ? sportType : undefined,
      sportCustomName:
        category === "sport" && sportType === "custom"
          ? sportCustomName
          : undefined,
      trailFrom:
        category === "sport" && activeSport?.hasTrail ? trailFrom : undefined,
      trailTo:
        category === "sport" && activeSport?.hasTrail ? trailTo : undefined,
      studyType: category === "study" ? studyType : undefined,
      priority,
      color,
      done: editTask?.done ?? false,
      lat: resolvedPlace?.latitude ?? editTask?.lat ?? randomCoord(),
      lng: resolvedPlace?.longitude ?? editTask?.lng ?? randomCoord(),
    };
    if (editTask) {
      updateTask(task);
    } else {
      addTask(task);
    }
    onClose();
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.back, { color: theme.mutedText }]}>‹</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>
            {editTask ? "Edit Task" : "New Task"}
          </Text>
          <Pressable
            onPress={handleSubmit}
            style={[styles.saveButton, { backgroundColor: `${accent}22` }]}
          >
            <Text style={{ color: accent, fontWeight: "700" }}>Save</Text>
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Field
            label="Task Name"
            value={name}
            onChangeText={setName}
            placeholder="What do you have to do?"
          />
          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Add details..."
            multiline
          />
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.mutedText }]}>
              Date & Time
            </Text>
            <Field
              label="Date"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
            />
            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Field
                  label="Start"
                  value={timeStart}
                  onChangeText={setTimeStart}
                  placeholder="09:00"
                />
              </View>
              <View style={styles.column}>
                <Field
                  label="End"
                  value={timeEnd}
                  onChangeText={setTimeEnd}
                  placeholder="10:00"
                />
              </View>
            </View>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.mutedText }]}>
              Place
            </Text>
            <View style={styles.placeRow}>
              <TextInput
                value={place}
                onChangeText={(value) => {
                  setPlace(value);
                  setResolvedPlace(null);
                  setPlaceStatus("");
                }}
                placeholder="Search a place or type here"
                placeholderTextColor={theme.mutedText}
                style={[
                  styles.input,
                  styles.placeInput,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
              <Pressable
                onPress={resolvePlace}
                style={[styles.findButton, { backgroundColor: accent }]}
              >
                <Text style={{ color: theme.background, fontWeight: "700" }}>
                  Find
                </Text>
              </Pressable>
            </View>
            {!!placeStatus && (
              <Text
                style={[
                  styles.placeStatus,
                  { color: resolvedPlace ? accent : "#ef4444" },
                ]}
              >
                {placeStatus}
              </Text>
            )}
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.mutedText }]}>
              Category
            </Text>
            <View style={styles.optionRow}>
              {(["sport", "study", "activity"] as Category[]).map((item) => {
                const active = category === item;
                const categoryColor = CATEGORY_COLORS[item];
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setCategory(item);
                      setColor(categoryColor);
                    }}
                    style={[
                      styles.option,
                      {
                        backgroundColor: active
                          ? `${categoryColor}22`
                          : theme.surface,
                        borderColor: active ? categoryColor : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? categoryColor : theme.mutedText,
                        fontWeight: "600",
                      }}
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          {category === "sport" && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.mutedText }]}>
                Sport Type
              </Text>
              <View style={styles.sportGrid}>
                {SPORT_TYPES.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setSportType(item.id)}
                    style={[
                      styles.option,
                      styles.sportOption,
                      {
                        backgroundColor:
                          sportType === item.id ? `${accent}22` : theme.surface,
                        borderColor:
                          sportType === item.id ? accent : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: sportType === item.id ? accent : theme.mutedText,
                      }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {sportType === "custom" && (
                <Field
                  label="Custom Sport"
                  value={sportCustomName}
                  onChangeText={setSportCustomName}
                  placeholder="Sport name..."
                />
              )}
              {activeSport?.hasTrail && (
                <View style={styles.twoColumns}>
                  <View style={styles.column}>
                    <Field
                      label="From"
                      value={trailFrom}
                      onChangeText={setTrailFrom}
                      placeholder="From..."
                    />
                  </View>
                  <View style={styles.column}>
                    <Field
                      label="To"
                      value={trailTo}
                      onChangeText={setTrailTo}
                      placeholder="To..."
                    />
                  </View>
                </View>
              )}
            </View>
          )}
          {category === "study" && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.mutedText }]}>
                Study Level
              </Text>
              {STUDY_TYPES.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setStudyType(item.id)}
                  style={[
                    styles.studyOption,
                    {
                      backgroundColor:
                        studyType === item.id ? "#3b82f622" : theme.surface,
                      borderColor:
                        studyType === item.id ? "#3b82f6" : theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.studyDot,
                      {
                        backgroundColor:
                          studyType === item.id ? "#3b82f6" : theme.border,
                      },
                    ]}
                  />
                  <Text
                    style={{
                      color:
                        studyType === item.id ? "#3b82f6" : theme.mutedText,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.mutedText }]}>
              Priority
            </Text>
            <View style={styles.optionRow}>
              {(["high", "medium", "low"] as Priority[]).map((item) => {
                const active = priority === item;
                const priorityColor = PRIORITY_COLORS[item];
                return (
                  <Pressable
                    key={item}
                    onPress={() => setPriority(item)}
                    style={[
                      styles.option,
                      {
                        backgroundColor: active
                          ? `${priorityColor}22`
                          : theme.surface,
                        borderColor: active ? priorityColor : theme.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        {
                          backgroundColor: active
                            ? priorityColor
                            : theme.border,
                        },
                      ]}
                    />
                    <Text
                      style={{
                        color: active ? priorityColor : theme.mutedText,
                      }}
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.mutedText }]}>
              Color
            </Text>
            <View style={styles.colorRow}>
              {TASK_COLORS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => {
                    setColor(item);
                    setShowCustomColor(false);
                  }}
                  style={[
                    styles.colorButton,
                    {
                      backgroundColor: item,
                      borderColor: color === item ? theme.text : "transparent",
                    },
                  ]}
                >
                  {color === item && <Text style={styles.colorCheck}>✓</Text>}
                </Pressable>
              ))}
              <Pressable
                accessibilityLabel="Choose custom color"
                onPress={() => {
                  setShowCustomColor(true);
                  if (isHexColor(customColor)) setColor(customColor);
                }}
                style={[
                  styles.colorButton,
                  styles.customColorButton,
                  {
                    backgroundColor: isHexColor(customColor)
                      ? customColor
                      : theme.surface,
                    borderColor: showCustomColor ? theme.text : theme.border,
                  },
                ]}
              >
                <Text style={[styles.customColorText, { color: theme.text }]}>
                  +
                </Text>
              </Pressable>
            </View>
            {showCustomColor && (
              <TextInput
                autoCapitalize="characters"
                maxLength={7}
                onChangeText={(value) => {
                  const nextColor = value.startsWith("#") ? value : `#${value}`;
                  setCustomColor(nextColor);
                  if (isHexColor(nextColor)) setColor(nextColor);
                }}
                placeholder="#RRGGBB"
                placeholderTextColor={theme.mutedText}
                value={customColor}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: isHexColor(customColor)
                      ? customColor
                      : theme.border,
                    color: theme.text,
                  },
                ]}
              />
            )}
          </View>
          <Pressable
            onPress={handleSubmit}
            style={[styles.submit, { backgroundColor: accent }]}
          >
            <Text style={{ color: theme.background, fontWeight: "800" }}>
              {editTask ? "Update Task" : "Add Task"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 16 : 12,
    paddingBottom: 14,
  },
  headerButton: { height: 38, justifyContent: "center", width: 50 },
  back: { fontSize: 36, fontWeight: "300", lineHeight: 36 },
  title: { fontSize: 17, fontWeight: "700" },
  saveButton: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  content: { gap: 20, padding: 20, paddingBottom: 40 },
  fieldGroup: { gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multilineInput: { minHeight: 82, textAlignVertical: "top" },
  twoColumns: { flexDirection: "row", gap: 10 },
  placeRow: { flexDirection: "row", gap: 8 },
  placeInput: { flex: 1 },
  findButton: {
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  placeStatus: { fontSize: 11 },
  column: { flex: 1 },
  optionRow: { flexDirection: "row", gap: 8 },
  option: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 8,
  },
  sportGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sportOption: { flexBasis: "30%", flexGrow: 1 },
  studyOption: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  studyDot: { borderRadius: 5, height: 10, width: 10 },
  priorityDot: { borderRadius: 5, height: 9, width: 9 },
  colorRow: { flexDirection: "row", gap: 7, justifyContent: "space-between" },
  colorButton: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  customColorButton: { borderStyle: "dashed" },
  customColorText: { fontSize: 18, fontWeight: "300", lineHeight: 20 },
  colorCheck: { color: "#fff", fontSize: 13, fontWeight: "800" },
  submit: { alignItems: "center", borderRadius: 14, marginTop: 4, padding: 16 },
});
