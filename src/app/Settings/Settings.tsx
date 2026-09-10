import * as Location from "expo-location";
import { useNavigation, useRouter } from "expo-router";
import { usePreventRemove } from "expo-router/build/react-navigation/core";
import { useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../../context/appContext";
import { useTheme } from "../../themeContext";
import type { AppSettings } from "../../types";

const ACCENT_COLORS = [
  { label: "Green", value: "#22c55e" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Orange", value: "#f97316" },
  { label: "Red", value: "#ef4444" },
];

const ACCENT_SWATCH_STYLES: Record<string, { backgroundColor: string }> = {
  "#22c55e": { backgroundColor: "#00ff00" },
  "#06b6d4": { backgroundColor: "#06b6d4" },
  "#3b82f6": { backgroundColor: "#3b82f6" },
  "#f97316": { backgroundColor: "#f97316" },
  "#ef4444": { backgroundColor: "#ef4444" },
};

const LANGUAGES = ["English", "Français", "العربية", "Español", "Deutsch"];
const HOME_MODES = [
  { label: "Current task", value: "current" as const },
  { label: "Next task", value: "next" as const },
];

const DEFAULT_SETTINGS: AppSettings = {
  language: "English",
  homeMode: "current",
  mapShowDone: false,
  mapShowFuture: false,
  startHour: 6,
  accentColor: "#22c55e",
  homeLatitude: undefined,
  homeLongitude: undefined,
  homePlace: "",
  workLatitude: undefined,
  workLongitude: undefined,
  workPlace: "",
  pitchLatitude: undefined,
  pitchLongitude: undefined,
  pitchPlace: "",
};

const CONFIRMABLE_SETTINGS: (keyof AppSettings)[] = [
  "language",
  "homeMode",
  "mapShowDone",
  "mapShowFuture",
  "startHour",
  "homeLatitude",
  "homeLongitude",
  "homePlace",
  "workLatitude",
  "workLongitude",
  "workPlace",
  "pitchLatitude",
  "pitchLongitude",
  "pitchPlace",
];

function formatHour(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return `${hour > 12 ? hour - 12 : hour} ${hour > 12 ? "PM" : "AM"}`;
}

function SectionHeader({ children }: { children: string }) {
  const { theme } = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: theme.mutedText }]}>
      {children}
    </Text>
  );
}

function SettingRow({
  label,
  sub,
  accent,
  modified = false,
  onReset,
  children,
}: {
  label: string;
  sub?: string;
  accent?: string;
  modified?: boolean;
  onReset?: () => void;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
      <View style={styles.settingCopy}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>
          {label}
        </Text>
        {sub && (
          <Text style={[styles.settingSub, { color: theme.mutedText }]}>
            {sub}
          </Text>
        )}
        {modified && onReset && (
          <Pressable onPress={onReset} hitSlop={6}>
            <Text style={[styles.resetText, { color: accent ?? theme.accent }]}>
              Reset
            </Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

function Dropdown<T extends string>({
  label,
  sub,
  value,
  options,
  onChange,
  accent,
  modified,
  onReset,
}: {
  label: string;
  sub?: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
  accent?: string;
  modified?: boolean;
  onReset?: () => void;
}) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const selected =
    options.find((option) => option.value === value)?.label ?? value;
  return (
    <View>
      <Pressable
        onPress={() => setOpen((expanded) => !expanded)}
        style={[
          styles.dropdownRow,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={[styles.dropdownCopy]}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>
            {label}
          </Text>
          {sub && (
            <Text style={[styles.settingSub, { color: theme.mutedText }]}>
              {sub}
            </Text>
          )}
          {modified && onReset && (
            <Pressable onPress={onReset} hitSlop={6}>
              <Text style={[styles.resetText, { color: value }]}>Reset</Text>
            </Pressable>
          )}
        </View>
        <View
          style={[
            styles.valueBox,
            { backgroundColor: theme.tabActive, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.dropdownValue, { color: theme.text }]}>
            {selected}
          </Text>
          <Text style={[styles.chevron, { color: theme.mutedText }]}>
            {open ? "−" : "+"}
          </Text>
        </View>
      </Pressable>
      {open && (
        <View
          style={[
            styles.inlineMenu,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              style={[styles.menuOption, { borderTopColor: theme.border }]}
            >
              <Text
                style={{
                  color:
                    option.value === value
                      ? (accent ?? theme.accent)
                      : theme.text,
                  fontWeight: option.value === value ? "700" : "500",
                }}
              >
                {option.label}
              </Text>
              {option.value === value && (
                <Text style={{ color: accent ?? theme.accent }}>✓</Text>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function AccentDropdown({
  value,
  onChange,
  customValue,
  onCustomChange,
  modified,
  onReset,
}: {
  value: string;
  onChange: (value: string) => void;
  customValue: string;
  onCustomChange: (value: string) => void;
  modified?: boolean;
  onReset?: () => void;
}) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = ACCENT_COLORS.find((color) => color.value === value);
  const isCustomActive = !selected;
  return (
    <View>
      <Pressable
        onPress={() => setOpen((expanded) => !expanded)}
        style={[
          styles.dropdownRow,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.dropdownCopy}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>
            Accent color
          </Text>
          <Text style={[styles.settingSub, { color: theme.mutedText }]}>
            Used for actions and highlights
          </Text>
          {modified && onReset && (
            <Pressable onPress={onReset} hitSlop={6}>
              <Text style={[styles.resetText, { color: value }]}>Reset</Text>
            </Pressable>
          )}
        </View>
        <View
          style={[
            styles.valueBox,
            { backgroundColor: theme.tabActive, borderColor: theme.border },
          ]}
        >
          <View style={[styles.accentDot, { backgroundColor: value }]} />
          <Text style={[styles.dropdownValue, { color: theme.text }]}>
            {selected?.label ?? "Custom"}
          </Text>
          <Text style={[styles.chevron, { color: theme.mutedText }]}>
            {open ? "−" : "+"}
          </Text>
        </View>
      </Pressable>
      {open && (
        <View
          style={[
            styles.inlineMenu,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {ACCENT_COLORS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              style={[styles.menuOption, { borderTopColor: theme.border }]}
            >
              <View style={styles.colorMenuOption}>
                <View
                  style={[styles.accentDot, ACCENT_SWATCH_STYLES[option.value]]}
                />
                <Text
                  style={{
                    color: option.value === value ? value : theme.text,
                    fontWeight: option.value === value ? "700" : "500",
                  }}
                >
                  {option.label}
                </Text>
              </View>
              {option.value === value && (
                <Text style={{ color: value }}>✓</Text>
              )}
            </Pressable>
          ))}
          <View
            style={[styles.customMenuRow, { borderTopColor: theme.border }]}
          >
            <View style={styles.colorMenuOption}>
              <View
                style={[
                  styles.accentDot,
                  { backgroundColor: isCustomActive ? value : customValue },
                ]}
              />
              <Text
                style={{
                  color: isCustomActive ? value : theme.text,
                  fontWeight: isCustomActive ? "700" : "500",
                }}
              >
                Custom
              </Text>
              {isCustomActive && <Text style={{ color: value }}>✓</Text>}
            </View>
            <TextInput
              autoCapitalize="characters"
              maxLength={7}
              value={customValue}
              onChangeText={onCustomChange}
              style={[
                styles.customAccentInput,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.tabActive,
                },
              ]}
              placeholder="#8B5CF6"
              placeholderTextColor={theme.mutedText}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default function Settings() {
  const { settings, updateSettings } = useApp();
  const { isDarkMode, theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [homeStatus, setHomeStatus] = useState("");
  const [customAccent, setCustomAccent] = useState(
    settings.accentColor.startsWith("#") &&
      !ACCENT_COLORS.some((item) => item.value === settings.accentColor)
      ? settings.accentColor
      : "#8b5cf6",
  );
  const hasChanges = CONFIRMABLE_SETTINGS.some(
    (key) => draft[key] !== settings[key],
  );
  const updateDraft = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const resetDraft = <K extends keyof AppSettings>(key: K) => {
    updateDraft(key, DEFAULT_SETTINGS[key]);
  };
  function setCustomAccentColor(value: string) {
    const next = value.startsWith("#") ? value : `#${value}`;
    setCustomAccent(next);
    if (/^#[0-9A-Fa-f]{6}$/.test(next)) updateSettings({ accentColor: next });
  }
  function selectSavedLocation(target: "home" | "work" | "pitch") {
    router.push({ pathname: "/Map/Map", params: { selectLocation: target } });
  }
  async function setHomeLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setHomeStatus("Location permission was denied");
      return;
    }
    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    updateDraft("homeLatitude", current.coords.latitude);
    updateDraft("homeLongitude", current.coords.longitude);
    updateDraft("homePlace", "Home");
    setHomeStatus("Home location set to your current location");
  }
  usePreventRemove(hasChanges, ({ data }) => {
    Alert.alert(
      "Unsaved settings",
      "Would you like to apply your changes before leaving?",
      [
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setDraft(settings);
            navigation.dispatch(data.action);
          },
        },
        {
          text: "Confirm",
          onPress: () => {
            updateSettings(draft);
            navigation.dispatch(data.action);
          },
        },
      ],
    );
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.bottom + 4 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        {hasChanges && (
          <Pressable onPress={() => updateSettings(draft)} hitSlop={8}>
            <Text style={[styles.defaultAction, { color: draft.accentColor }]}>
              Set as default
            </Text>
          </Pressable>
        )}
      </View>

      <SectionHeader>APPEARANCE</SectionHeader>
      <View
        style={[
          styles.section,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <SettingRow
          label="Dark mode"
          sub="Use the dark app theme"
          accent={draft.accentColor}
        >
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: draft.accentColor }}
            thumbColor={theme.buttonText}
          />
        </SettingRow>
        <AccentDropdown
          value={settings.accentColor}
          onChange={(accentColor) => {
            updateSettings({ accentColor });
            setDraft((current) => ({ ...current, accentColor }));
          }}
          customValue={customAccent}
          onCustomChange={setCustomAccentColor}
        />
      </View>

      <SectionHeader>HOME</SectionHeader>
      <View style={styles.section}>
        <Dropdown
          label="Default card"
          sub="What to show on the home card"
          accent={draft.accentColor}
          value={draft.homeMode}
          modified={draft.homeMode !== settings.homeMode}
          onReset={() => resetDraft("homeMode")}
          options={HOME_MODES}
          onChange={(homeMode) => updateDraft("homeMode", homeMode)}
        />
      </View>

      <SectionHeader>MAP</SectionHeader>
      <View
        style={[
          styles.section,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <SettingRow
          label="Show completed"
          sub="Display done tasks on the map"
          accent={draft.accentColor}
          modified={draft.mapShowDone !== settings.mapShowDone}
          onReset={() => resetDraft("mapShowDone")}
        >
          <Switch
            value={draft.mapShowDone}
            onValueChange={(mapShowDone) =>
              updateDraft("mapShowDone", mapShowDone)
            }
            trackColor={{ false: theme.border, true: draft.accentColor }}
            thumbColor={theme.buttonText}
          />
        </SettingRow>
        <SettingRow
          label="Show future tasks"
          sub="Display upcoming tasks on the map"
          accent={draft.accentColor}
          modified={draft.mapShowFuture !== settings.mapShowFuture}
          onReset={() => resetDraft("mapShowFuture")}
        >
          <Switch
            value={draft.mapShowFuture}
            onValueChange={(mapShowFuture) =>
              updateDraft("mapShowFuture", mapShowFuture)
            }
            trackColor={{ false: theme.border, true: draft.accentColor }}
            thumbColor={theme.buttonText}
          />
        </SettingRow>
      </View>

      <SectionHeader>HOME LOCATION</SectionHeader>
      <View
        style={[
          styles.section,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <SettingRow
          label="Home location"
          sub={
            draft.homePlace || "Used by home, maison, dar, desktop, and bureau"
          }
          accent={draft.accentColor}
          modified={
            draft.homeLatitude !== settings.homeLatitude ||
            draft.homeLongitude !== settings.homeLongitude ||
            draft.homePlace !== settings.homePlace
          }
          onReset={() => {
            resetDraft("homeLatitude");
            resetDraft("homeLongitude");
            resetDraft("homePlace");
          }}
        >
          <Pressable
            onPress={setHomeLocation}
            style={[styles.homeButton, { backgroundColor: draft.accentColor }]}
          >
            <Text style={{ color: theme.background, fontWeight: "700" }}>
              Use current
            </Text>
          </Pressable>
        </SettingRow>
        {!!homeStatus && (
          <Text
            style={[
              styles.placeStatus,
              {
                color:
                  draft.homeLatitude !== undefined
                    ? draft.accentColor
                    : "#ef4444",
              },
            ]}
          >
            {homeStatus}
          </Text>
        )}
      </View>

      {(["work", "pitch"] as const).map((target) => {
        const place = draft[`${target}Place`];
        const latitude = draft[`${target}Latitude`];
        const longitude = draft[`${target}Longitude`];
        return (
          <View key={target} style={styles.locationSection}>
            <SectionHeader>{target.toUpperCase()}</SectionHeader>
            <View
              style={[
                styles.section,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <SettingRow
                label={`${target[0].toUpperCase() + target.slice(1)} location`}
                sub={place || `Select your ${target} on the map`}
                accent={draft.accentColor}
                modified={
                  latitude !== settings[`${target}Latitude`] ||
                  longitude !== settings[`${target}Longitude`] ||
                  place !== settings[`${target}Place`]
                }
                onReset={() => {
                  resetDraft(`${target}Latitude`);
                  resetDraft(`${target}Longitude`);
                  resetDraft(`${target}Place`);
                }}
              >
                <Pressable
                  onPress={() => selectSavedLocation(target)}
                  style={[
                    styles.homeButton,
                    { backgroundColor: draft.accentColor },
                  ]}
                >
                  <Text style={{ color: theme.background, fontWeight: "700" }}>
                    Select map
                  </Text>
                </Pressable>
              </SettingRow>
            </View>
          </View>
        );
      })}

      <SectionHeader>SCHEDULE</SectionHeader>
      <View
        style={[
          styles.section,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <SettingRow
          label="Day starts at"
          sub="First hour shown in schedule"
          accent={draft.accentColor}
          modified={draft.startHour !== settings.startHour}
          onReset={() => resetDraft("startHour")}
        >
          <View style={styles.stepper}>
            <Pressable
              onPress={() =>
                updateDraft("startHour", Math.max(0, draft.startHour - 1))
              }
              style={[styles.stepButton, { backgroundColor: theme.tabActive }]}
            >
              <Text style={{ color: theme.text }}>-</Text>
            </Pressable>
            <Text style={[styles.hourValue, { color: theme.text }]}>
              {formatHour(draft.startHour)}
            </Text>
            <Pressable
              onPress={() =>
                updateDraft("startHour", Math.min(12, draft.startHour + 1))
              }
              style={[styles.stepButton, { backgroundColor: theme.tabActive }]}
            >
              <Text style={{ color: theme.text }}>+</Text>
            </Pressable>
          </View>
        </SettingRow>
      </View>

      <SectionHeader>LANGUAGE</SectionHeader>
      <View style={styles.section}>
        <Dropdown
          label="App language"
          sub="Choose the language used in the app"
          accent={draft.accentColor}
          value={draft.language}
          modified={draft.language !== settings.language}
          onReset={() => resetDraft("language")}
          options={LANGUAGES.map((language) => ({
            label: language,
            value: language,
          }))}
          onChange={(language) => updateDraft("language", language)}
        />
      </View>

      <Pressable
        onPress={() => {
          updateSettings({ accentColor: DEFAULT_SETTINGS.accentColor });
          setDraft(DEFAULT_SETTINGS);
        }}
        style={[
          styles.resetAll,
          { borderColor: theme.border, backgroundColor: theme.importantSurface },
        ]}
      >
        <Text style={[styles.resetAllLabel, { color: "white" }]}>
          Reset settings
        </Text>
        <Text style={[styles.settingSub, { color: "#dddddd" }]}>
          Restore the default app preferences
        </Text>
      </Pressable>

      <View style={styles.footer}>
        <View
          style={[styles.logo, { backgroundColor: `${draft.accentColor}22` }]}
        >
        <Image source={require('../../../assets/images/ActvBlackLogo.png')} style={styles.logo}/>
        </View>
        <Text style={[styles.appName, { color: theme.text }]}>Actv</Text>
        <Text style={[styles.version, { color: theme.mutedText }]}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 30, fontWeight: "700" },
  defaultAction: { fontSize: 13, fontWeight: "700" },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 8,
    marginTop: 18,
  },
  section: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  settingRow: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingCopy: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: "600" },
  settingSub: { fontSize: 11, marginTop: 4 },
  resetText: { fontSize: 11, fontWeight: "600", marginTop: 5 },
  customMenuRow: {
    alignItems: "center",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 16,
  },
  customAccentInput: {
    borderRadius: 7,
    borderWidth: 1,
    fontSize: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
    width: 96,
  },
  locationSection: { marginTop: 2 },
  homeButton: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  placeStatus: { fontSize: 11, paddingHorizontal: 16, paddingBottom: 12 },
  dropdownRow: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  dropdownCopy: { flex: 1 },
  valueBox: {
    alignItems: "center",
    borderRadius: 7,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minWidth: 96,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  dropdownValue: { fontSize: 12, fontWeight: "600" },
  chevron: { fontSize: 18, lineHeight: 18 },
  inlineMenu: { borderTopWidth: 1, overflow: "hidden" },
  menuOption: {
    alignItems: "center",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  accentDot: { borderRadius: 8, height: 16, width: 16 },
  colorMenuOption: { alignItems: "center", flexDirection: "row", gap: 10 },
  resetAll: { borderRadius: 12, borderWidth: 1, marginTop: 24, padding: 16 },
  resetAllLabel: { fontSize: 14, fontWeight: "700" },
  stepper: { alignItems: "center", flexDirection: "row", gap: 8 },
  stepButton: {
    alignItems: "center",
    borderRadius: 7,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  hourValue: {
    fontSize: 13,
    fontWeight: "700",
    minWidth: 48,
    textAlign: "center",
  },
  footer: { alignItems: "center", gap: 4, paddingVertical: 34 },
  logo: {
    alignItems: "center",
    borderRadius: 13,
    height: 48,
    justifyContent: "center",
    marginBottom: 6,
    width: 48,
  },
  logoText: { fontSize: 22, fontWeight: "900" },
  appName: { fontSize: 14, fontWeight: "700" },
  version: { fontSize: 11 },
});