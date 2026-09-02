import { StyleSheet, View, Text } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons';

const Navbar = () => {
  return (
    <View style={styles.container}>
      <Icon name="home" size={40} color="#000" />
      <Icon name="map" size={40} color="#000" />
      <Icon name="square" size={40} color="#000" />
      <Icon name="settings" size={40} color="#000" />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    display:"flex",
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height:64,
    backgroundColor:"white",
    width:"100%",
    bottom:0,
    position:"absolute",
  },
});
export default Navbar