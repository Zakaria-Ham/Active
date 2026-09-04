import { StyleSheet, Text, View } from "react-native";

export default function Settings() {
  return (
    <View>
      <Text>Settings</Text>
    </View>
  )
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