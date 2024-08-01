import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import RadialVariant from '../components/RadialVar';


function TempControl() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Device Selected:</Text>
        <Text style={styles.deviceName}>Home device</Text>
       <RadialVariant initialSpeed={50} min = {0} max={120} />
       <Text style={styles.caption}>Adjust the smart water heater temperature to suit you</Text>

      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1b252d",
        color: 'white'
    },
    text:{
      fontSize: 15,
      marginTop: 50,
      alignSelf: 'left',
      marginLeft: 20,
      color: 'white',
      fontWeight: '600'
    },
    deviceName: {
      color: "white",
      fontSize: 24,
      alignSelf: 'left',
      marginLeft: 20,
      fontWeight: '600'
  },
  caption: {
    fontSize: 15,
        color: '#FFFFFF',
        marginTop: 20,  
        textAlign: 'center',  
  },

});

export default TempControl;