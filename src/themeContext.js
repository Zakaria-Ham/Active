import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export const lightTheme = {
  background: "#F7F8FA",
  surface: "#FFFFFF",
  text: "#111827",
  mutedText: "#6B7280",
  border: "#E5E7EB",
  accent: "#00B800",
  tabBar: "#FFFFFF",
  tabActive: "#E8F8E8",
  buttonBg: "#00B800",
  buttonText: "#FFFFFF",
  importantSurface: "#D92A0D",
};

export const darkTheme = {
  background: "#0a0a0a",
  surface: "#202020",
  text: "#FFFFFF",
  mutedText: "#A1A1AA",
  border: "#3F3F46",
  accent: "#00FF00",
  tabBar: "#202020",
  tabActive: "#0a0a0a",
  buttonBg: "#00FF00",
  buttonText: "#FFFFFF",
  importantSurface: "#D92A0D",
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === "dark");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("userTheme");
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark");
        }
      } catch (error) {
        console.log("Error loading theme preference:", error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newThemeValue = !isDarkMode;
      setIsDarkMode(newThemeValue);
      await AsyncStorage.setItem("userTheme", newThemeValue ? "dark" : "light");
    } catch (error) {
      console.log("Error saving theme preference:", error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
