import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import AddTaskModal from "../../components/addTaskModel";
import MapTaskDetails from "../../components/mapTaskDetails";
import { useApp } from "../../context/appContext";
import { useTheme } from "../../themeContext";

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function MapScreen() {
  const { theme, isDarkMode } = useTheme();
  const { tasks, settings, updateSettings } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ selectLocation?: string }>();

  const selectionTarget = params.selectLocation as
    "home" | "work" | "pitch" | undefined;

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [initialLocation, setInitialLocation] =
    useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskPlace, setTaskPlace] = useState("");
  const [taskCoordinates, setTaskCoordinates] = useState<Coordinates>();
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(
    null,
  );
  const [refreshingLocation, setRefreshingLocation] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const insets = useSafeAreaInsets();

  async function startLocation() {
    try {
      setRefreshingLocation(true);
      setErrorMsg(null);

      subscriptionRef.current?.remove();
      subscriptionRef.current = null;

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setInitialLocation(null);
        setLocation(null);
        setErrorMsg("Location permission is required to display the map.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(current);
      setInitialLocation(current);

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (next) => {
          setLocation(next);
          setInitialLocation((previous) => previous ?? next);
        },
      );
    } catch (error) {
      setInitialLocation(null);
      setLocation(null);
      setErrorMsg(
        error instanceof Error ? error.message : "Unable to get your location.",
      );
    } finally {
      setRefreshingLocation(false);
    }
  }

  useEffect(() => {
    startLocation();

    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (
      !location ||
      !initialLocation ||
      location.timestamp === initialLocation.timestamp
    ) {
      return;
    }

    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "userLocation",
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      }),
    );
  }, [location, initialLocation]);

  async function searchPlace() {
    if (!search.trim()) return;

    try {
      const result = (await Location.geocodeAsync(search.trim()))[0];

      if (!result) {
        throw new Error("Place not found");
      }

      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "search",
          lat: result.latitude,
          lng: result.longitude,
          label: search.trim(),
        }),
      );

      setSearchStatus("Location found");
    } catch (error) {
      setSearchStatus(
        error instanceof Error ? error.message : "Place not found",
      );
    }
  }

  async function reversePlace(latitude: number, longitude: number) {
    try {
      const first = (
        await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        })
      )[0];

      return (
        [first?.name, first?.street, first?.city].filter(Boolean).join(", ") ||
        `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      );
    } catch {
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }
  }

  async function handleLongPress(latitude: number, longitude: number) {
    if (selectionTarget) {
      const place = await reversePlace(latitude, longitude);

      const key = selectionTarget === "home" ? "home" : selectionTarget;

      updateSettings({
        [`${key}Latitude`]: latitude,
        [`${key}Longitude`]: longitude,
        [`${key}Place`]: place,
      } as Partial<typeof settings>);

      Alert.alert(
        "Location saved",
        `${
          selectionTarget[0].toUpperCase() + selectionTarget.slice(1)
        } location selected.`,
      );

      router.back();
      return;
    }

    const place = await reversePlace(latitude, longitude);

    Alert.alert("Map location", place, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Show route",
        onPress: () =>
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "route",
              lat: latitude,
              lng: longitude,
            }),
          ),
      },
      {
        text: "Add task",
        onPress: () => {
          setTaskPlace(place);
          setTaskCoordinates({
            latitude,
            longitude,
          });
          setShowTaskModal(true);
        },
      },
    ]);
  }

  function selectTask(index: number) {
    if (index < 0 || index >= tasks.length) return;

    setSelectedTaskIndex(index);

    const task = tasks[index];

    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "centerTask",
        lat: task.lat,
        lng: task.lng,
      }),
    );
  }

  function previousTask() {
    if (selectedTaskIndex === null) return;

    const nextIndex = selectedTaskIndex - 1;

    if (nextIndex >= 0) {
      selectTask(nextIndex);
    }
  }

  function nextTask() {
    if (selectedTaskIndex === null) return;

    const nextIndex = selectedTaskIndex + 1;

    if (nextIndex < tasks.length) {
      selectTask(nextIndex);
    }
  }

  if (!initialLocation) {
    return (
      <View
        style={[
          styles.locationScreen,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <View
          style={[
            styles.locationCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.locationTitle, { color: theme.text }]}>
            Location unavailable
          </Text>

          <Text style={[styles.locationMessage, { color: theme.mutedText }]}>
            {errorMsg ?? "Your location is needed to load the map."}
          </Text>

          <Pressable
            onPress={startLocation}
            disabled={refreshingLocation}
            style={[
              styles.refreshButton,
              {
                backgroundColor: settings.accentColor,
                opacity: refreshingLocation ? 0.6 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.refreshButtonText,
                {
                  color: theme.background,
                },
              ]}
            >
              {refreshingLocation ? "Refreshing..." : "Refresh Location"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const taskMarkers = JSON.stringify(
    tasks.map((task) => {
      const taskData = task as typeof task & {
        time?: string;
        description?: string;
        place?: string;
      };

      return {
        lat: task.lat,
        lng: task.lng,
        name: task.name,
        priority: task.priority,
        color: task.color,
        time: taskData.time ?? "",
        description: taskData.description ?? "",
        place: taskData.place ?? "",
      };
    }),
  );

  const startLat = initialLocation.coords.latitude;
  const startLng = initialLocation.coords.longitude;

  const mapHTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>
<style>
html,body,#map{
  height:100%;
  margin:0;
  padding:0
}
.task-pin{
  background:transparent;
  border:0
}
</style>
</head>
<body>
<div id="map"></div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
const map = L
  .map('map', { zoomControl: false })
  .setView([${startLat}, ${startLng}], 16);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '© OpenStreetMap'
  }
).addTo(map);

const redIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [20, 33],
  iconAnchor: [12, 30]
});

const userMarker = L.marker(
  [${startLat}, ${startLng}],
  { icon: redIcon }
).addTo(map);

const border = ${isDarkMode ? "'#fff'" : "'#000'"};

const tasksData = ${taskMarkers};

tasksData.forEach((task, index) => {
  let icon;

  if (task.priority === 'high') {
    icon = redIcon;
  } else {
    const size =
      task.priority === 'medium'
        ? 16
        : 12;

    icon = L.divIcon({
      className: 'task-pin',
      html:
        '<span style="' +
        'display:block;' +
        'width:' + size + 'px;' +
        'height:' + size + 'px;' +
        'border-radius:50%;' +
        'background:' + task.color + ';' +
        'border:2px solid ' + border + ';' +
        '"></span>',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  const marker = L.marker(
    [task.lat, task.lng],
    { icon }
  ).addTo(map);

  marker.on('click', () => {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'taskPress',
        index
      })
    );

    map.setView(
      [task.lat, task.lng],
      16,
      { animate: true }
    );
  });
});

let routeLine;
let searchMarker;
let timer;

function nativeMessage(data) {
  if (data.type === 'userLocation') {
    userMarker.setLatLng([
      data.lat,
      data.lng
    ]);
  }

  if (data.type === 'search') {
    if (searchMarker) {
      map.removeLayer(searchMarker);
    }

    searchMarker = L
      .marker([data.lat, data.lng])
      .addTo(map)
      .bindPopup(data.label)
      .openPopup();

    map.setView(
      [data.lat, data.lng],
      16
    );
  }

  if (data.type === 'route') {
    if (routeLine) {
      map.removeLayer(routeLine);
    }

    routeLine = L.polyline(
      [
        [${startLat}, ${startLng}],
        [data.lat, data.lng]
      ],
      {
        color: '${settings.accentColor}',
        weight: 4,
        dashArray: '8 8'
      }
    ).addTo(map);

    map.fitBounds(
      routeLine.getBounds(),
      {
        padding: [30, 30]
      }
    );
  }

  if (data.type === 'centerTask') {
    map.setView(
      [data.lat, data.lng],
      16,
      { animate: true }
    );
  }
}

document.addEventListener(
  'message',
  (event) => {
    try {
      nativeMessage(
        JSON.parse(event.data)
      );
    } catch (error) {}
  }
);

window.addEventListener(
  'message',
  (event) => {
    try {
      nativeMessage(
        JSON.parse(event.data)
      );
    } catch (error) {}
  }
);

map.on('touchstart', (e) => {
  timer = setTimeout(() => {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'longPress',
        lat: e.latlng.lat,
        lng: e.latlng.lng
      })
    );
  }, 2000);
});

map.on(
  'touchend touchcancel',
  () => clearTimeout(timer)
);

map.on('contextmenu', (e) => {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      type: 'longPress',
      lat: e.latlng.lat,
      lng: e.latlng.lng
    })
  );
});
</script>

</body>
</html>
`;

  const selectedTask =
    selectedTaskIndex !== null ? tasks[selectedTaskIndex] : null;

  const selectedTaskData = selectedTask as
    | (typeof selectedTask & {
        time?: string;
        description?: string;
        place?: string;
      })
    | null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            marginTop: 12 + insets.top,
          },
        ]}
      >
        <TextInput
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            setSearchStatus("");
          }}
          onSubmitEditing={searchPlace}
          placeholder="Search a place"
          placeholderTextColor={theme.mutedText}
          style={[
            styles.searchInput,
            {
              color: theme.text,
            },
          ]}
        />

        <Pressable
          onPress={searchPlace}
          style={[
            styles.searchButton,
            {
              backgroundColor: settings.accentColor,
            },
          ]}
        >
          <Text
            style={{
              color: theme.background,
              fontWeight: "700",
            }}
          >
            Find
          </Text>
        </Pressable>
      </View>

      {!!searchStatus && (
        <Text
          style={[
            styles.searchStatus,
            {
              color: theme.text,
            },
          ]}
        >
          {searchStatus}
        </Text>
      )}

      {selectionTarget && (
        <View
          style={[
            styles.selectionBanner,
            {
              backgroundColor: settings.accentColor,
              marginTop: 68 + insets.top,
            },
          ]}
        >
          <Text
            style={{
              color: theme.background,
              fontWeight: "700",
            }}
          >
            Long-press to select {selectionTarget}
          </Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{
          html: mapHTML,
        }}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);

            if (message.type === "longPress") {
              handleLongPress(message.lat, message.lng);
              return;
            }

            if (message.type === "taskPress") {
              selectTask(message.index);
            }
          } catch {}
        }}
        style={styles.map}
      />

      {selectedTaskIndex !== null && selectedTaskData && (
        <MapTaskDetails
          task={{
            lat: selectedTaskData.lat,
            lng: selectedTaskData.lng,
            name: selectedTaskData.name,
            priority: selectedTaskData.priority,
            color: selectedTaskData.color,
            time: selectedTaskData.time,
            description: selectedTaskData.description,
            place: selectedTaskData.place,
          }}
          index={selectedTaskIndex}
          total={tasks.length}
          onPrevious={previousTask}
          onNext={nextTask}
        />
      )}

      {showTaskModal && (
        <AddTaskModal
          onClose={() => setShowTaskModal(false)}
          initialPlace={taskPlace}
          initialCoordinates={taskCoordinates}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  locationScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  locationCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },
  locationMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 22,
  },
  refreshButton: {
    minWidth: 170,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 13,
    alignItems: "center",
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  map: {
    flex: 1,
  },
  searchBar: {
    alignSelf: "center",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    left: 12,
    padding: 5,
    position: "absolute",
    right: 12,
    zIndex: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  searchButton: {
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchStatus: {
    left: 16,
    position: "absolute",
    top: 60,
    zIndex: 5,
  },
  selectionBanner: {
    alignItems: "center",
    left: 12,
    padding: 8,
    position: "absolute",
    right: 12,
    zIndex: 5,
    borderRadius: 15,
  },
});
