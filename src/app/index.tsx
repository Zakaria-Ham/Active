import { Text, View, StyleSheet, Pressable } from "react-native";
import "../../global.css";
import { Link } from "expo-router";

export default function index() {
  const date = new Date();
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    date,
  );
  const dayNum = new Intl.DateTimeFormat("en-US", { day:"2-digit" }).format(
    date,
  );
  const month = new Intl.DateTimeFormat("en-US", { month:"long" }).format(
    date,
  );
  return (
    <View style={styles.App}>
      <Text className="text-white bg-green-500">{today}, {dayNum} {month}</Text>
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },
  Link: {
    color: "white",
    borderColor: "white",
    padding: 2,
  },
});
