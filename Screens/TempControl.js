import * as React from 'react';
import { View, StyleSheet, Text, Pressable} from 'react-native';
import RadialVariant from '../components/RadialVar';
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue,update  } from "firebase/database";
import { useDevice } from '../context/DeviceContext';

function TempControl() {
  const { selectedDevice, deviceInfo } = useDevice(); 
  const [data, setData] = useState(0);
  const [speed, setSpeed] = useState(120);
  useEffect(() => {
    const db = getDatabase();
    const deviceref = ref(db, 'controllers/device_002');
    onValue(deviceref, (snapshot) => {
      const data = snapshot.val();
      setData(data.temperature);
      setSpeed(data.temperature)
      console.log(deviceInfo);
      console.log(selectedDevice);
    });

    console.log("runnin")
    return;
  }, []);

  useEffect(() => {
      console.log(speed)
    },[speed]);


  function changeTemp() {
    const db = getDatabase();
    console.log(speed)
    const updates = {};
    updates['controllers/device_002/temperature'] = speed;
    update(ref(db), updates)
      .catch((error) => {
        console.error('Error updating temperature:', error);
      });
      setData(speed)
  }
    return (
      <View style={styles.container}>
        
        <Text style={styles.text}>Device Selected:</Text>
        <Text style={styles.deviceName}>{selectedDevice || "No Device Selected"}</Text>
        <Text style={styles.text}>Current Temp: {data}</Text>
        <Pressable style={styles.btnPressable } onPress={changeTemp}  >
          <Text style={styles.btnText}>Set Temp</Text>
        </Pressable>
        <RadialVariant speed={speed} setSpeed={setSpeed} />
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
    btnPressable:{
      color: 'white',
      backgroundColor: 'white',
      padding: 5,
      alignSelf:'center'
    }
    ,
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