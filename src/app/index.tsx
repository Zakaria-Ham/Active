  import { Text, View } from "react-native";
  import "../../global.css";
  import TaskWidget from "../components/taskWidget";
  import { useSafeAreaInsets } from "react-native-safe-area-context";

  export default function index() {
    const insets = useSafeAreaInsets();
    const date = new Date();
    
    const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
    const dayNum = new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(date);
    const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);

    return (
      <View className="flex-1 bg-[#111]">
          <View className="w-full bg-[#202020] justify-end pt-safe-offset-8 px-4">
            <Text className="text-white text-2xl font-bold bottom-0">
              {today}, {dayNum} {month}
            </Text>
          </View>
          <View className="flex justify-center px-4 py-6">
            <Text className="color-white font-extrabold text-3xl my-2">Welcome Back,</Text>
          <TaskWidget title="Test ASD 3" time="00:11" place="alger 1" />
          </View>
      </View>
    );
  }
