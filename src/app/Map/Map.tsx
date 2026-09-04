import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

const lat = 36.7133047308867;
const lng = 3.1542667993899807;

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
    const map = L.map('map').setView([${lat}, ${lng}], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    L.marker([${lat}, ${lng}]).addTo(map);
  </script>
</body>
</html>
`;

export default function App() {
  return (
    <View style={styles.container}>
      <WebView originWhitelist={["*"]} source={{ html: mapHTML }} style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});