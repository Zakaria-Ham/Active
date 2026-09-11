import * as Location from "expo-location";
import { Link, useNavigation, useRouter } from "expo-router";
import { usePreventRemove } from "expo-router/build/react-navigation/core";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  Linking,
  Modal,
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
  {
    label: "Current task",
    value: "current" as const,
  },
  {
    label: "Next task",
    value: "next" as const,
  },
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
    <Text
      style={[
        styles.sectionHeader,
        {
          color: theme.mutedText,
        },
      ]}
    >
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
    <View
      style={[
        styles.settingRow,
        {
          borderBottomColor: theme.border,
        },
      ]}
    >
      <View style={styles.settingCopy}>
        <Text
          style={[
            styles.settingLabel,
            {
              color: theme.text,
            },
          ]}
        >
          {label}
        </Text>

        {sub && (
          <Text
            style={[
              styles.settingSub,
              {
                color: theme.mutedText,
              },
            ]}
          >
            {sub}
          </Text>
        )}

        {modified && onReset && (
          <Pressable onPress={onReset} hitSlop={6}>
            <Text
              style={[
                styles.resetText,
                {
                  color: accent ?? theme.accent,
                },
              ]}
            >
              Reset
            </Text>
          </Pressable>
        )}
      </View>

      {children}
    </View>
  );
}

function PopupAnimation({
  visible,
  top,
  right,
  width,
  backgroundColor,
  borderColor,
  children,
  onClose,
}: {
  visible: boolean;
  top: number;
  right: number;
  width: number;
  backgroundColor: string;
  borderColor: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const animation = useRef(new Animated.Value(0)).current;

  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      animation.setValue(0);

      Animated.timing(animation, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 140,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setMounted(false);
        }
      });
    }
  }, [visible, animation, mounted]);

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          style={[
            styles.popupBase,
            {
              top,
              right,
              width,
              backgroundColor,
              borderColor,
              opacity,
              transform: [
                {
                  translateY,
                },
                {
                  scale,
                },
              ],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
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
  options: {
    label: string;
    value: T;
  }[];
  onChange: (value: T) => void;
  accent?: string;
  modified?: boolean;
  onReset?: () => void;
}) {
  const { theme } = useTheme();

  const [open, setOpen] = useState(false);

  const [popupY, setPopupY] = useState(0);

  const optionRef = useRef<View>(null);

  const selected =
    options.find((option) => option.value === value)?.label ?? value;

  function toggleDropdown() {
    if (open) {
      setOpen(false);
      return;
    }

    optionRef.current?.measureInWindow((_x, y, _width, height) => {
      setPopupY(y + height + 6);
      setOpen(true);
    });
  }

  return (
    <View style={styles.dropdownContainer}>
      <View style={styles.dropdownContent}>
        <View style={styles.dropdownCopy}>
          <Text
            style={[
              styles.settingLabel,
              {
                color: theme.text,
              },
            ]}
          >
            {label}
          </Text>

          {sub && (
            <Text
              style={[
                styles.settingSub,
                {
                  color: theme.mutedText,
                },
              ]}
            >
              {sub}
            </Text>
          )}

          {modified && onReset && (
            <Pressable onPress={onReset} hitSlop={6}>
              <Text
                style={[
                  styles.resetText,
                  {
                    color: accent ?? theme.accent,
                  },
                ]}
              >
                Reset
              </Text>
            </Pressable>
          )}
        </View>

        <View ref={optionRef} collapsable={false}>
          <Pressable
            onPress={toggleDropdown}
            style={[
              styles.valueBox,
              {
                backgroundColor: theme.tabActive,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.dropdownValue,
                {
                  color: theme.text,
                },
              ]}
            >
              {selected}
            </Text>

            <Text
              style={[
                styles.chevron,
                {
                  color: theme.mutedText,
                },
              ]}
            >
              {open ? "−" : "+"}
            </Text>
          </Pressable>
        </View>
      </View>

      <PopupAnimation
        visible={open}
        top={popupY}
        right={36}
        width={175}
        backgroundColor={theme.surface}
        borderColor={theme.border}
        onClose={() => setOpen(false)}
      >
        {options.map((option, index) => (
          <Pressable
            key={option.value}
            onPress={() => {
              onChange(option.value);
              setOpen(false);
            }}
            style={[
              styles.smallDropdownOption,
              index !== 0 && {
                borderTopWidth: 1,
                borderTopColor: theme.border,
              },
            ]}
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
              <Text
                style={{
                  color: accent ?? theme.accent,
                }}
              >
                ✓
              </Text>
            )}
          </Pressable>
        ))}
      </PopupAnimation>
    </View>
  );
}

function AccentDropdown({
  value,
  onChange,
  customValue,
  onCustomChange,
}: {
  value: string;
  onChange: (value: string) => void;
  customValue: string;
  onCustomChange: (value: string) => void;
}) {
  const { theme } = useTheme();

  const [open, setOpen] = useState(false);

  const [popupY, setPopupY] = useState(0);

  const optionRef = useRef<View>(null);

  const selected = ACCENT_COLORS.find((color) => color.value === value);

  const isCustomActive = !selected;

  function toggleDropdown() {
    if (open) {
      setOpen(false);
      return;
    }

    optionRef.current?.measureInWindow((_x, y, _width, height) => {
      setPopupY(y + height + 6);
      setOpen(true);
    });
  }

  return (
    <View style={styles.dropdownContainer}>
      <View style={styles.dropdownContent}>
        <View style={styles.dropdownCopy}>
          <Text
            style={[
              styles.settingLabel,
              {
                color: theme.text,
              },
            ]}
          >
            Accent color
          </Text>

          <Text
            style={[
              styles.settingSub,
              {
                color: theme.mutedText,
              },
            ]}
          >
            Used for actions and highlights
          </Text>
        </View>

        <View ref={optionRef} collapsable={false}>
          <Pressable
            onPress={toggleDropdown}
            style={[
              styles.valueBox,
              {
                backgroundColor: theme.tabActive,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.accentDot,
                {
                  backgroundColor: value,
                },
              ]}
            />

            <Text
              style={[
                styles.dropdownValue,
                {
                  color: theme.text,
                },
              ]}
            >
              {selected?.label ?? "Custom"}
            </Text>

            <Text
              style={[
                styles.chevron,
                {
                  color: theme.mutedText,
                },
              ]}
            >
              {open ? "−" : "+"}
            </Text>
          </Pressable>
        </View>
      </View>

      <PopupAnimation
        visible={open}
        top={popupY}
        right={36}
        width={220}
        backgroundColor={theme.surface}
        borderColor={theme.border}
        onClose={() => setOpen(false)}
      >
        {ACCENT_COLORS.map((option, index) => (
          <Pressable
            key={option.value}
            onPress={() => {
              onChange(option.value);
              setOpen(false);
            }}
            style={[
              styles.smallDropdownOption,
              index !== 0 && {
                borderTopWidth: 1,
                borderTopColor: theme.border,
              },
            ]}
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
              <Text
                style={{
                  color: value,
                }}
              >
                ✓
              </Text>
            )}
          </Pressable>
        ))}

        <View
          style={[
            styles.customMenuRow,
            {
              borderTopColor: theme.border,
            },
          ]}
        >
          <View style={styles.colorMenuOption}>
            <View
              style={[
                styles.accentDot,
                {
                  backgroundColor: isCustomActive ? value : customValue,
                },
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

            {isCustomActive && (
              <Text
                style={{
                  color: value,
                }}
              >
                ✓
              </Text>
            )}
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
      </PopupAnimation>
    </View>
  );
}

type LocationTarget = "home" | "work" | "pitch";

function LocationDropdown({
  target,
  settings,
  draft,
  accent,
  onReset,
  onCurrentLocation,
  onSelectMap,
}: {
  target: LocationTarget;
  settings: AppSettings;
  draft: AppSettings;
  accent: string;
  onReset: () => void;
  onCurrentLocation: (target: LocationTarget) => Promise<void>;
  onSelectMap: (target: LocationTarget) => void;
}) {
  const { theme } = useTheme();

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [popupY, setPopupY] = useState(0);

  const optionRef = useRef<View>(null);

  const placeKey = `${target}Place` as keyof AppSettings;

  const latitudeKey = `${target}Latitude` as keyof AppSettings;

  const longitudeKey = `${target}Longitude` as keyof AppSettings;

  const place = draft[placeKey] as string;

  const latitude = draft[latitudeKey] as number | undefined;

  const longitude = draft[longitudeKey] as number | undefined;

  const settingsPlace = settings[placeKey] as string;

  const settingsLatitude = settings[latitudeKey] as number | undefined;

  const settingsLongitude = settings[longitudeKey] as number | undefined;

  const isSet = latitude !== undefined && longitude !== undefined;

  const modified =
    latitude !== settingsLatitude ||
    longitude !== settingsLongitude ||
    place !== settingsPlace;

  const title = target[0].toUpperCase() + target.slice(1);

  function toggleDropdown() {
    if (open) {
      setOpen(false);
      return;
    }

    optionRef.current?.measureInWindow((_x, y, _width, height) => {
      setPopupY(y + height + 6);
      setOpen(true);
    });
  }

  async function handleCurrentLocation() {
    try {
      setLoading(true);

      await onCurrentLocation(target);

      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={[
        styles.locationItem,
        {
          borderBottomColor: theme.border,
        },
      ]}
    >
      <View style={styles.locationHeader}>
        <View style={styles.locationCopy}>
          <Text
            style={[
              styles.settingLabel,
              {
                color: theme.text,
              },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.settingSub,
              {
                color: theme.mutedText,
              },
            ]}
          >
            {isSet
              ? place || `${title} location selected`
              : `${title} location is not set`}
          </Text>

          {!isSet && (
            <Text
              style={[
                styles.locationInfo,
                {
                  color: accent,
                },
              ]}
            >
              Set {target} to your current location
            </Text>
          )}

          {modified && (
            <Pressable onPress={onReset} hitSlop={6}>
              <Text
                style={[
                  styles.resetText,
                  {
                    color: accent,
                  },
                ]}
              >
                Reset
              </Text>
            </Pressable>
          )}
        </View>

        <View ref={optionRef} collapsable={false}>
          <Pressable
            onPress={toggleDropdown}
            style={[
              styles.locationTrigger,
              {
                backgroundColor: theme.tabActive,
                borderColor: theme.border,
              },
            ]}
          >
            {isSet && (
              <View
                style={[
                  styles.locationStatusDot,
                  {
                    backgroundColor: accent,
                  },
                ]}
              />
            )}

            <Text
              style={[
                styles.chevron,
                {
                  color: theme.mutedText,
                },
              ]}
            >
              {open ? "−" : "+"}
            </Text>
          </Pressable>
        </View>
      </View>

      <PopupAnimation
        visible={open}
        top={popupY}
        right={36}
        width={230}
        backgroundColor={theme.surface}
        borderColor={theme.border}
        onClose={() => setOpen(false)}
      >
        <Pressable
          onPress={handleCurrentLocation}
          disabled={loading}
          style={[
            styles.locationPopupOption,
            {
              opacity: loading ? 0.5 : 1,
            },
          ]}
        >
          <View style={styles.locationPopupCopy}>
            <Text
              style={[
                styles.locationPopupTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              {loading ? "Getting location..." : "Use current location"}
            </Text>

            <Text
              style={[
                styles.locationPopupSub,
                {
                  color: theme.mutedText,
                },
              ]}
            >
              Use where you are now
            </Text>
          </View>

          <Text
            style={[
              styles.locationPopupArrow,
              {
                color: accent,
              },
            ]}
          >
            ›
          </Text>
        </Pressable>

        <View
          style={[
            styles.locationPopupDivider,
            {
              backgroundColor: theme.border,
            },
          ]}
        />

        <Pressable
          onPress={() => {
            setOpen(false);
            onSelectMap(target);
          }}
          style={styles.locationPopupOption}
        >
          <View style={styles.locationPopupCopy}>
            <Text
              style={[
                styles.locationPopupTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Select map
            </Text>

            <Text
              style={[
                styles.locationPopupSub,
                {
                  color: theme.mutedText,
                },
              ]}
            >
              Choose manually on the map
            </Text>
          </View>

          <Text
            style={[
              styles.locationPopupArrow,
              {
                color: accent,
              },
            ]}
          >
            ›
          </Text>
        </Pressable>
      </PopupAnimation>
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
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetDraft = <K extends keyof AppSettings>(key: K) => {
    updateDraft(key, DEFAULT_SETTINGS[key]);
  };

  function setCustomAccentColor(value: string) {
    const next = value.startsWith("#") ? value : `#${value}`;

    setCustomAccent(next);

    if (/^#[0-9A-Fa-f]{6}$/.test(next)) {
      updateSettings({
        accentColor: next,
      });

      setDraft((current) => ({
        ...current,
        accentColor: next,
      }));
    }
  }

  function selectSavedLocation(target: LocationTarget) {
    router.push({
      pathname: "/Map/Map",
      params: {
        selectLocation: target,
      },
    });
  }

  async function setLocationToCurrent(target: LocationTarget) {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      if (target === "home") {
        setHomeStatus("Location permission was denied");
      }

      Alert.alert(
        "Location permission",
        `Location permission is required to set your ${target} location.`,
      );

      return;
    }

    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const latitude = current.coords.latitude;

      const longitude = current.coords.longitude;

      const placeKey = `${target}Place` as keyof AppSettings;

      const latitudeKey = `${target}Latitude` as keyof AppSettings;

      const longitudeKey = `${target}Longitude` as keyof AppSettings;

      updateDraft(latitudeKey, latitude as AppSettings[typeof latitudeKey]);

      updateDraft(longitudeKey, longitude as AppSettings[typeof longitudeKey]);

      updateDraft(
        placeKey,
        `${target[0].toUpperCase()}${target.slice(
          1,
        )}` as AppSettings[typeof placeKey],
      );

      if (target === "home") {
        setHomeStatus("Home location set to your current location");
      }
    } catch {
      Alert.alert(
        "Location error",
        `Unable to get your current location for ${target}.`,
      );
    }
  }

  async function openFeedback() {
    const url =
      "mailto:contactpro.feedbacks.zakariaham@gmail.com?subject=Actv%20Feedback";

    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(
          "Email unavailable",
          "No email application is available on this device.",
        );
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert("Email error", "Unable to open your email application.");
    }
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
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleRow}>
        <Text
          style={[
            styles.title,
            {
              color: theme.text,
            },
          ]}
        >
          Settings
        </Text>

        {hasChanges && (
          <Pressable onPress={() => updateSettings(draft)} hitSlop={8}>
            <Text
              style={[
                styles.defaultAction,
                {
                  color: draft.accentColor,
                },
              ]}
            >
              Set as default
            </Text>
          </Pressable>
        )}
      </View>

      <SectionHeader>APPEARANCE</SectionHeader>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
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
            trackColor={{
              false: theme.border,
              true: draft.accentColor,
            }}
            thumbColor={theme.buttonText}
          />
        </SettingRow>

        <AccentDropdown
          value={settings.accentColor}
          onChange={(accentColor) => {
            updateSettings({
              accentColor,
            });

            setDraft((current) => ({
              ...current,
              accentColor,
            }));
          }}
          customValue={customAccent}
          onCustomChange={setCustomAccentColor}
        />
      </View>

      <SectionHeader>HOME</SectionHeader>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Dropdown
          label="Default task mode"
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
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <SettingRow
          label="Show completed tasks"
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
            trackColor={{
              false: theme.border,
              true: draft.accentColor,
            }}
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
            trackColor={{
              false: theme.border,
              true: draft.accentColor,
            }}
            thumbColor={theme.buttonText}
          />
        </SettingRow>
      </View>

      <SectionHeader>LOCATION</SectionHeader>

      <View
        style={[
          styles.locationSection,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <LocationDropdown
          target="home"
          settings={settings}
          draft={draft}
          accent={draft.accentColor}
          onReset={() => {
            resetDraft("homeLatitude");
            resetDraft("homeLongitude");
            resetDraft("homePlace");
          }}
          onCurrentLocation={setLocationToCurrent}
          onSelectMap={selectSavedLocation}
        />

        <LocationDropdown
          target="work"
          settings={settings}
          draft={draft}
          accent={draft.accentColor}
          onReset={() => {
            resetDraft("workLatitude");
            resetDraft("workLongitude");
            resetDraft("workPlace");
          }}
          onCurrentLocation={setLocationToCurrent}
          onSelectMap={selectSavedLocation}
        />

        <LocationDropdown
          target="pitch"
          settings={settings}
          draft={draft}
          accent={draft.accentColor}
          onReset={() => {
            resetDraft("pitchLatitude");
            resetDraft("pitchLongitude");
            resetDraft("pitchPlace");
          }}
          onCurrentLocation={setLocationToCurrent}
          onSelectMap={selectSavedLocation}
        />
      </View>

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

      <SectionHeader>SCHEDULE</SectionHeader>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
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
              style={[
                styles.stepButton,
                {
                  backgroundColor: theme.tabActive,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.text,
                }}
              >
                -
              </Text>
            </Pressable>

            <Text
              style={[
                styles.hourValue,
                {
                  color: theme.text,
                },
              ]}
            >
              {formatHour(draft.startHour)}
            </Text>

            <Pressable
              onPress={() =>
                updateDraft("startHour", Math.min(12, draft.startHour + 1))
              }
              style={[
                styles.stepButton,
                {
                  backgroundColor: theme.tabActive,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.text,
                }}
              >
                +
              </Text>
            </Pressable>
          </View>
        </SettingRow>
      </View>

      <SectionHeader>LANGUAGE</SectionHeader>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Dropdown
          label="App language"
          sub="Choose the language used in the app (not Ready)"
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

      <SectionHeader>FEEDBACK</SectionHeader>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <SettingRow
          label="Send feedback"
          sub="Report Bugs, Ask for suggestions, your opinion improve the user experience"
        >
          <Pressable
            onPress={openFeedback}
            style={[
              styles.feedbackButton,
              {
                backgroundColor: draft.accentColor,
              },
            ]}
          >
            <Text
              style={[
                styles.feedbackButtonText,
                {
                  color: theme.background,
                },
              ]}
            >
              Email
            </Text>
          </Pressable>
        </SettingRow>
      </View>

      <Pressable
        onPress={() => {
          updateSettings({
            accentColor: DEFAULT_SETTINGS.accentColor,
          });

          setDraft(DEFAULT_SETTINGS);
        }}
        style={[
          styles.resetAll,
          {
            borderColor: theme.border,
            backgroundColor: theme.importantSurface,
          },
        ]}
      >
        <Text
          style={[
            styles.resetAllLabel,
            {
              color: "white",
            },
          ]}
        >
          Reset settings
        </Text>

        <Text
          style={[
            styles.settingSub,
            {
              color: "#dddddd",
            },
          ]}
        >
          Restore the default app preferences
        </Text>
      </Pressable>

      <View style={styles.footer}>
        <View
          style={[
            styles.logo,
            {
              backgroundColor: `${draft.accentColor}22`,
            },
          ]}
        >
          <Image
            source={require("../../../assets/images/ActvBlackLogo.png")}
            style={styles.logo}
          />
        </View>

        <Text
          style={[
            styles.appName,
            {
              color: theme.text,
            },
          ]}
        >
          Actv
        </Text>

        <Text
          style={[
            styles.version,
            {
              color: theme.mutedText,
            },
          ]}
        >
          Version 1.0.0
        </Text>
        <Link href={"/Settings/nestedLegals"}>
          <Text style={[styles.privacyTerms, { color: theme.text }]}>
            Privacy Policy & Term of Use
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 30,
  },

  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
  },

  defaultAction: {
    fontSize: 13,
    fontWeight: "700",
  },

  sectionHeader: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginBottom: 8,
    marginTop: 18,
  },

  section: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },

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

  settingCopy: {
    flex: 1,
  },

  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  settingSub: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },

  resetText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 5,
  },

  dropdownContainer: {
    width: "100%",
  },

  dropdownContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  dropdownCopy: {
    flex: 1,
    paddingRight: 8,
  },

  valueBox: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minWidth: 96,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  dropdownValue: {
    fontSize: 12,
    fontWeight: "600",
  },

  chevron: {
    fontSize: 18,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
  },

  popupBase: {
    position: "absolute",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 4,
    elevation: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },

  smallDropdownOption: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 42,
    paddingHorizontal: 12,
  },

  accentDot: {
    borderRadius: 8,
    height: 16,
    width: 16,
    flexShrink: 0,
  },

  colorMenuOption: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: 10,
    minWidth: 0,
  },

  customMenuRow: {
    alignItems: "center",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  customAccentInput: {
    borderRadius: 7,
    borderWidth: 1,
    flexShrink: 0,
    fontSize: 11,
    height: 34,
    paddingHorizontal: 8,
    paddingVertical: 5,
    width: 82,
  },

  locationSection: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },

  locationItem: {
    borderBottomWidth: 1,
  },

  locationHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  locationCopy: {
    flex: 1,
    paddingRight: 12,
  },

  locationTrigger: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minWidth: 42,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  locationStatusDot: {
    borderRadius: 5,
    height: 9,
    width: 9,
  },

  locationInfo: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
    marginTop: 5,
  },

  locationPopupOption: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 54,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  locationPopupCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  locationPopupTitle: {
    fontSize: 12,
    fontWeight: "700",
  },

  locationPopupSub: {
    fontSize: 10,
    lineHeight: 13,
    marginTop: 3,
  },

  locationPopupArrow: {
    fontSize: 23,
    fontWeight: "300",
  },

  locationPopupDivider: {
    height: 1,
    marginHorizontal: 10,
  },

  placeStatus: {
    fontSize: 11,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  feedbackButton: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  feedbackButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },

  resetAll: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    padding: 16,
  },

  resetAllLabel: {
    fontSize: 14,
    fontWeight: "700",
  },

  stepper: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  stepButton: {
    alignItems: "center",
    borderRadius: 8,
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

  footer: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 34,
  },

  logo: {
    alignItems: "center",
    borderRadius: 13,
    height: 48,
    justifyContent: "center",
    marginBottom: 6,
    width: 48,
  },

  appName: {
    fontSize: 14,
    fontWeight: "700",
  },

  version: {
    fontSize: 11,
  },
  privacyTerms: {
    fontSize: 12,
  },
});
