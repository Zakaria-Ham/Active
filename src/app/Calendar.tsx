import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Calendar as CalendarComponent } from "react-native-calendars";

export default function Calendar(){
  const [selectedDate, setSelectedDate] = useState("");
  return (
    <View style={styles.container}>
      <CalendarComponent
        // 2. Capture the click event and update state
        onDayPress={(day: any) => {
          setSelectedDate(day.dateString);
        }}

        style={{
          borderRadius: "",
        }}
        theme={{
          calendarBackground: "transparent",

          selectedDayBackgroundColor: "#6366f1",
          selectedDayTextColor: "#ffffff",

          selectedDotColor: "#ffffff",

          agendaDayNumColor: "#000000",
          dayTextColor: "#cbd5e1",
          todayTextColor: "#dddddd",
          monthTextColor: "#ffffff",
          arrowColor: "#6366f1",
        }}

        markedDates={{
          [selectedDate]: {
            selected: true,
            disableTouchEvent: true,
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
