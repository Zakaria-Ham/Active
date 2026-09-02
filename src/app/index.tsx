import { Text, View, StyleSheet, TouchableHighlight } from "react-native";
import "../../global.css";
import { Link } from "expo-router";
import { useState } from "react";
import { Calendar } from "react-native-calendars";
import Navbar from "./components/UI/Navbar";

export default function Index() {
  const date = new Date();
  const today = new Intl.DateTimeFormat("en-US", { day:"2-digit", weekday: "long" }).format(
    date,
  );
   const [selectedDate, setSelectedDate] = useState('');

  return (
    <View style={styles.App}>
      <Text className="text-white bg-green-500">{today}</Text>
      <Link href={"./Map"} style={styles.Link}>map</Link>
      <TouchableHighlight>
        <Text>I am a touchable opacity</Text>
      </TouchableHighlight>
       <Calendar
        // Outer Tailwind layout
        className="bg-slate-900 rounded-3xl p-4 border border-slate-800"
        
        // 2. Capture the click event and update state
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}

        style={{
          borderRadius:"",
        }}
        theme={{
          calendarBackground: 'transparent',
          
          selectedDayBackgroundColor: '#6366f1',
          selectedDayTextColor: '#ffffff',
          
          selectedDotColor: '#ffffff',
          
          agendaDayNumColor:"#000000",
          dayTextColor: '#cbd5e1',
          todayTextColor: '#dddddd',
          monthTextColor: '#ffffff',
          arrowColor: '#6366f1',
        }}

        markedDates={{
          [selectedDate]: { 
            selected: true, 
            disableTouchEvent: true,
          },
        }}
      />
      <Navbar />
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
