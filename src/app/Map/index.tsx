import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <Text>check this map</Text>
      <MapView 
        style={styles.map} 
        initialRegion={initialRegion}
      >
        <Marker 
          coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
          title="San Francisco"
          description="This is a marker description"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:"#111",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 48,
    marginTop: 24,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
