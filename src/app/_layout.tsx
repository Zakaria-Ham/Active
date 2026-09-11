import { faCalendar } from "@fortawesome/free-solid-svg-icons/faCalendar";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons/faClipboardList";
import { faHouse } from "@fortawesome/free-solid-svg-icons/faHouse";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons/faMapLocationDot";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Tabs, usePathname } from "expo-router";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AddTaskModal from "../components/addTaskModel";
import { AppProvider, useApp } from "../context/appContext";
import { ThemeProvider, useTheme } from "../themeContext";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <TabLayout />
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function TabLayout() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { settings } = useApp();
  const pathname = usePathname();
  const [showAddTask, setShowAddTask] = useState(false);
  const isSettings = pathname.startsWith("/Settings");
  return (
    <View style={styles.root}>
      <Tabs
        initialRouteName="index"
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarInactiveTintColor: theme.mutedText,
          tabBarActiveTintColor: settings.accentColor,
          tabBarInactiveBackgroundColor: theme.tabBar,
          tabBarActiveBackgroundColor: theme.tabActive,
          tabBarStyle: {
            position: "relative",
            justifyContent: "center",
            backgroundColor: theme.tabBar,
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
          name="Schedule/Schedule"
          options={{
            title: "Schedule",
            tabBarIconStyle: {},
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
          name="Settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <FontAwesomeIcon
                icon={faGear}
                size={size}
                color={color as string}
              />
            ),
          }}
        />
      </Tabs>
      {!isSettings && (
        <Pressable
          accessibilityLabel="Add task"
          onPress={() => setShowAddTask(true)}
          style={[
            styles.addButton,
            {
              backgroundColor: settings.accentColor,
              bottom: 75 + insets.bottom,
            },
          ]}
        >
          <Text style={[styles.addButtonText, { color: theme.background }]}>
            +
          </Text>
        </Pressable>
      )}
      {showAddTask && <AddTaskModal onClose={() => setShowAddTask(false)} />}
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { settings } = useApp();

  return (
    <View
      style={[
        styles.customTabBar,
        {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          paddingBottom: 4 + insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        const options = descriptor.options;
        const focused = state.index === index;
        const color = focused ? settings.accentColor : theme.mutedText;
        const icon = options.tabBarIcon?.({
          focused,
          color,
          size: 26,
        });

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={styles.customTabItem}
          >
            {icon}
            <Text style={[styles.customTabLabel, { color }]}>
              {options.title ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  customTabBar: {
    borderTopWidth: 1,
    flexDirection: "row",
    minHeight: 60,
    paddingHorizontal: 6,
    paddingTop: 6,
  },
  customTabItem: {
    alignItems: "center",
    flex: 1,
    gap: 5,
    justifyContent: "center",
    minHeight: 56,
  },
  customTabLabel: { fontSize: 12, fontWeight: "600" },
  addButton: {
    alignItems: "center",
    borderRadius: 29,
    elevation: 5,
    height: 58,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    width: 58,
  },
  addButtonText: { fontSize: 32, fontWeight: "300", lineHeight: 34 },
});
