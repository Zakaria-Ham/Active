import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [initialLocation, setInitialLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    async function startWatching() {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (newLocation) => {
          setLocation(newLocation);

          // Set the map's starting point only once
          setInitialLocation((prev) => prev ?? newLocation);
        },
      );
    }

    startWatching();

    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  // Once the map is loaded, push every subsequent location update into the WebView
  // instead of rebuilding mapHTML (which would reload the whole page).
  useEffect(() => {
    if (!location || !initialLocation) return;

    // Skip sending the very first fix — it's already baked into the initial mapHTML.
    if (location.timestamp === initialLocation.timestamp) return;

    webViewRef.current?.postMessage(
      JSON.stringify({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      }),
    );
  }, [location, initialLocation]);

  if (!initialLocation) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg ?? "Getting location..."}</Text>
      </View>
    );
  }

  const startLat = initialLocation.coords.latitude;
  const startLng = initialLocation.coords.longitude;

  const mapHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map('map', { zoomControl: false }).setView([${startLat}, ${startLng}], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [20, 33],
        iconAnchor: [12, 30]
      });
      const marker = L.marker([${startLat}, ${startLng}], { icon: redIcon }).addTo(map);

      function updateMarker(lat, lng) {
        const newLatLng = new L.LatLng(lat, lng);
        marker.setLatLng(newLatLng);
        map.panTo(newLatLng);
      }

      // Android WebView delivers messages via 'message' on document,
      // iOS delivers via 'message' on window — listen on both for compatibility.
      function handleMessage(event) {
        try {
          const data = JSON.parse(event.data);
          updateMarker(data.lat, data.lng);
        } catch (e) {}
      }
      document.addEventListener('message', handleMessage);
      window.addEventListener('message', handleMessage);
    </script>
  </body>
  </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: mapHTML }}
        style={styles.map}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});