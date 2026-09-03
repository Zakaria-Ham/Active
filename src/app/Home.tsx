import { Text, View, StyleSheet, TouchableHighlight } from "react-native";
import "../../global.css";
import { Link } from "expo-router";

export default function Index() {
  const date = new Date();
  const today = new Intl.DateTimeFormat("en-US", { day:"2-digit", weekday: "long" }).format(
    date,
  );

  return (
    <View style={styles.App}>
      <Text className="text-white bg-green-500">{today}</Text>
      <Link href={"./Map"} style={styles.Link}>map</Link>
      <TouchableHighlight>
        <Text>I am a touchable opacity</Text>
      </TouchableHighlight>
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
  Link:{
    color:"white",
    borderColor:"white",
    padding:2,
  },
});
