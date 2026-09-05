import { Text, View, StyleSheet, Pressable } from "react-native";
import "../../global.css";
import { Link } from "expo-router";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function index() {
  const insets = useSafeAreaInsets();
  const date = new Date();
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  const dayNum = new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);

  return (
    <View style={[styles.App, { paddingTop: 10 + insets.top }]}>
      <View style={styles.header}>
        <Text className="text-white bg-green-500">
          {today}, {dayNum} {month}
        </Text>
      </View>
      <Link href={"./Map/Map"} style={styles.Link}>
        map
      </Link>
      <Pressable>
        <Text>I am a touchable opacity</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  App: {
    flex: 1,
    backgroundColor: "#111",
  },
  header: {
    top: 0,
    display: "flex",
    alignItems:"flex-start",
    padding:20,
    fontSize:20,
  },
  Link: {
    color: "white",
    borderColor: "white",
    padding: 2,
  },
});