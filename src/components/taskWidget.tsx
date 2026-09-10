import { Text, View } from "react-native";
import { useTheme } from "../themeContext";

export interface TaskWidgetProps {
  title: string;
  time: string;
  place: string;
}

const TaskWidget = ({ title, time, place }: TaskWidgetProps) => {
  const nextTask = true;
  const { theme } = useTheme();

  if (nextTask) {
    return (
      <View
        className="justify-center p-4 rounded-2xl"
        style={{ backgroundColor: theme.buttonBg }}
      >
        <View className="flex flex-row justify-between">
          <Text
            className="text-2xl font-bold"
            style={{ color: theme.buttonText }}
          >
            <Text className="font-extrabold" style={{ color: theme.text }}>
              {"> "}
            </Text>
            {title}
          </Text>
          <Text style={{ color: theme.buttonText }}>{time}</Text>
        </View>
        <View>
          <Text
            className="font-light opacity-85"
            style={{ color: theme.buttonText }}
          >
            {place}
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <View
        className="justify-center p-4 rounded-2xl border-dashed border-2"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <View className="flex flex-row justify-center py-16">
          <Text
            className="text-sm font-light opacity-60"
            style={{ color: theme.mutedText }}
          >
            No Tasks remaining for today
          </Text>
        </View>
      </View>
    );
  }
};

export default TaskWidget;
