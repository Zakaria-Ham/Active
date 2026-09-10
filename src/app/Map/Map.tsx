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
import { useApp } from "../../context/appContext";
import { useTheme } from "../../themeContext";

type Coordinates = { latitude: number; longitude: number };

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
  const webViewRef = useRef<WebView>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function startWatching() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access your location was denied");
        return;
      }
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
    }
    startWatching();
    return () => subscriptionRef.current?.remove();
  }, []);

  useEffect(() => {
    if (
      !location ||
      !initialLocation ||
      location.timestamp === initialLocation.timestamp
    )
      return;
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
      if (!result) throw new Error("Place not found");
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
        await Location.reverseGeocodeAsync({ latitude, longitude })
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
        `${selectionTarget[0].toUpperCase() + selectionTarget.slice(1)} location selected.`,
      );
      router.back();
      return;
    }
    const place = await reversePlace(latitude, longitude);
    Alert.alert("Map location", place, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Show route",
        onPress: () =>
          webViewRef.current?.postMessage(
            JSON.stringify({ type: "route", lat: latitude, lng: longitude }),
          ),
      },
      {
        text: "Add task",
        onPress: () => {
          setTaskPlace(place);
          setTaskCoordinates({ latitude, longitude });
          setShowTaskModal(true);
        },
      },
    ]);
  }

  if (!initialLocation)
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>
          {errorMsg ?? "Getting location..."}
        </Text>
      </View>
    );

  const taskMarkers = JSON.stringify(
    tasks.map((task) => ({
      lat: task.lat,
      lng: task.lng,
      name: task.name,
      priority: task.priority,
      color: task.color,
    })),
  );
  const startLat = initialLocation.coords.latitude;
  const startLng = initialLocation.coords.longitude;
  const mapHTML = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"/><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><style>html,body,#map{height:100%;margin:0;padding:0}.task-pin{background:transparent;border:0}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
  const map=L.map('map',{zoomControl:false}).setView([${startLat},${startLng}],16); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
  const redIcon=L.icon({iconUrl:'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',iconSize:[20,33],iconAnchor:[12,30]}); const userMarker=L.marker([${startLat},${startLng}],{icon:redIcon}).addTo(map); const border=${isDarkMode ? "'#fff'" : "'#000'"};
  ${taskMarkers}.forEach(task=>{let icon;if(task.priority==='high')icon=redIcon;else{const size=task.priority==='medium'?16:12;icon=L.divIcon({className:'task-pin',html:'<span style="display:block;width:'+size+'px;height:'+size+'px;border-radius:50%;background:'+task.color+';border:2px solid '+border+';"></span>',iconSize:[size,size],iconAnchor:[size/2,size/2]});}L.marker([task.lat,task.lng],{icon}).bindPopup(task.name).addTo(map);});
  let routeLine,searchMarker; function nativeMessage(data){if(data.type==='userLocation'){userMarker.setLatLng([data.lat,data.lng]);}if(data.type==='search'){if(searchMarker)map.removeLayer(searchMarker);searchMarker=L.marker([data.lat,data.lng]).addTo(map).bindPopup(data.label).openPopup();map.setView([data.lat,data.lng],16);}if(data.type==='route'){if(routeLine)map.removeLayer(routeLine);routeLine=L.polyline([[${startLat},${startLng}],[data.lat,data.lng]],{color:'${settings.accentColor}',weight:4,dashArray:'8 8'}).addTo(map);map.fitBounds(routeLine.getBounds(),{padding:[30,30]});}}
  document.addEventListener('message',e=>{try{nativeMessage(JSON.parse(e.data));}catch(x){}});window.addEventListener('message',e=>{try{nativeMessage(JSON.parse(e.data));}catch(x){}});let timer;map.on('touchstart',e=>{timer=setTimeout(()=>window.ReactNativeWebView.postMessage(JSON.stringify({type:'longPress',lat:e.latlng.lat,lng:e.latlng.lng})),2000);});map.on('touchend touchcancel',()=>clearTimeout(timer));map.on('contextmenu',e=>window.ReactNativeWebView.postMessage(JSON.stringify({type:'longPress',lat:e.latlng.lat,lng:e.latlng.lng})));
  </script></body></html>`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.searchBar,
          { backgroundColor: theme.surface, borderColor: theme.border, marginTop: 12 + insets.top, },
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
          style={[styles.searchInput, { color: theme.text }]}
        />
        <Pressable
          onPress={searchPlace}
          style={[
            styles.searchButton,
            { backgroundColor: settings.accentColor },
          ]}
        >
          <Text style={{ color: theme.background, fontWeight: "700" }}>
            Find
          </Text>
        </Pressable>
      </View>
      {!!searchStatus && (
        <Text style={[styles.searchStatus, { color: theme.text }]}>
          {searchStatus}
        </Text>
      )}
      {selectionTarget && (
        <View
          style={[
            styles.selectionBanner,
            { backgroundColor: settings.accentColor, marginTop:68 + insets.top, },
          ]}
        >
          <Text style={{ color: theme.background, fontWeight: "700" }}>
            Long-press to select {selectionTarget}
          </Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: mapHTML }}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === "longPress")
              handleLongPress(message.lat, message.lng);
          } catch {}
        }}
        style={styles.map}
      />
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
  container: { flex: 1 },
  map: { flex: 1 },
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
  searchInput: { flex: 1, height: 40, paddingHorizontal: 10 },
  searchButton: { borderRadius: 7, paddingHorizontal: 12, paddingVertical: 10 },
  searchStatus: { left: 16, position: "absolute", top: 60, zIndex: 5 },
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
