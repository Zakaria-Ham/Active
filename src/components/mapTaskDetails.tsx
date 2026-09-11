import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../themeContext";

type MapTask = {
  name: string;
  time?: string;
  description?: string;
  place?: string;
  priority?: string;
  color?: string;
  lat: number;
  lng: number;
};

type MapTaskDetailsProps = {
  task: MapTask;
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
};

export default function MapTaskDetails({
  task,
  index,
  total,
  onPrevious,
  onNext,
}: MapTaskDetailsProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.colorDot,
              {
                backgroundColor: task.color || "#356BBA",
              },
            ]}
          />

          <View style={styles.titleText}>
            <Text
              numberOfLines={1}
              style={[styles.title, { color: theme.text }]}
            >
              {task.name}
            </Text>

            {!!task.priority && (
              <Text
                style={[
                  styles.priority,
                  {
                    color: theme.mutedText,
                  },
                ]}
              >
                {task.priority}
              </Text>
            )}
          </View>
        </View>

        <Text style={[styles.counter, { color: theme.mutedText }]}>
          {index + 1}/{total}
        </Text>
      </View>

      <View style={styles.infoList}>
        {!!task.time && (
          <View style={styles.infoRow}>
            <Text style={[styles.icon, { color: theme.text }]}>◷</Text>

            <View style={styles.infoContent}>
              <Text style={[styles.label, { color: theme.mutedText }]}>
                Time
              </Text>

              <Text style={[styles.value, { color: theme.text }]}>
                {task.time}
              </Text>
            </View>
          </View>
        )}

        {!!task.place && (
          <View style={styles.infoRow}>
            <Text style={[styles.icon, { color: theme.text }]}>⌖</Text>

            <View style={styles.infoContent}>
              <Text style={[styles.label, { color: theme.mutedText }]}>
                Place
              </Text>

              <Text style={[styles.value, { color: theme.text }]}>
                {task.place}
              </Text>
            </View>
          </View>
        )}

        {!!task.description && (
          <View style={styles.descriptionContainer}>
            <Text style={[styles.label, { color: theme.mutedText }]}>
              Description
            </Text>

            <Text style={[styles.description, { color: theme.text }]}>
              {task.description}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.navigation}>
        <Pressable
          onPress={onPrevious}
          disabled={index === 0}
          style={[
            styles.navButton,
            {
              borderColor: theme.border,
              backgroundColor: index === 0 ? theme.background : theme.surface,
              opacity: index === 0 ? 0.45 : 1,
            },
          ]}
        >
          <Text style={[styles.arrow, { color: theme.text }]}>‹</Text>

          <Text style={[styles.navText, { color: theme.text }]}>Previous</Text>
        </Pressable>

        <Pressable
          onPress={onNext}
          disabled={index === total - 1}
          style={[
            styles.navButton,
            {
              backgroundColor:
                index === total - 1 ? theme.background : theme.surface,
              borderColor: theme.border,
              opacity: index === total - 1 ? 0.45 : 1,
            },
          ]}
        >
          <Text style={[styles.navText, { color: theme.text }]}>Next</Text>

          <Text style={[styles.arrow, { color: theme.text }]}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
  },
  priority: {
    fontSize: 12,
    marginTop: 2,
    textTransform: "capitalize",
  },
  counter: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 12,
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 26,
    fontSize: 19,
    textAlign: "center",
    marginRight: 8,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
  },
  descriptionContainer: {
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  navigation: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  navButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  arrow: {
    fontSize: 24,
    lineHeight: 24,
  },
  navText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
