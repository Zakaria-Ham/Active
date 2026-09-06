import { faCalendar } from "@fortawesome/free-solid-svg-icons/faCalendar";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons/faClipboardList";
import { faHouse } from "@fortawesome/free-solid-svg-icons/faHouse";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons/faMapLocationDot";
import { faSave } from "@fortawesome/free-solid-svg-icons/faSave";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Tabs, usePathname } from "expo-router";
import { useState } from "react";
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <TabLayout />
    </SafeAreaProvider>
  );
}

function TabLayout() {
  const Path = usePathname();
  const insets = useSafeAreaInsets();
  const [badgeNum, setBadgeNum] = useState<number>(1);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: "#00d800",
        tabBarActiveTintColor: "#00ff00",
        tabBarInactiveBackgroundColor: "#202020",
        tabBarActiveBackgroundColor: "#101010",
        tabBarStyle: {
          position: "relative",
          justifyContent: "center",
          backgroundColor: "#202020",
          height: 60 + insets.bottom,
          padding: insets.bottom,
        },
        tabBarHideOnKeyboard: true,
        tabBarBadgeStyle: {
          bottom: 0,
          position: "absolute",
          top: -4,
          right: -8,
          backgroundColor: "red",
          alignSelf: "flex-start",
          borderRadius: 10,
          maxWidth: 10,
          height: 18,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="Calendar/Calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcon
              icon={faCalendar}
              size={size}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Tasks/Tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcon
              icon={faClipboardList}
              size={size}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcon
              icon={faHouse}
              size={size}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Map/Map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcon
              icon={faMapLocationDot}
              size={size}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings/Settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <FontAwesomeIcon
              icon={faSave}
              size={size}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}
