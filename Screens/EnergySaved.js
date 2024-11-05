import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Tips from './Carousel';
import { getDatabase, ref, set, onValue } from "firebase/database";
import { useDevice } from '../context/DeviceContext';

function EnergySaved() {
  const [data, setData] = useState([60, 60, 60, 60, 60, 60]);
  const { selectedDevice, deviceInfo } = useDevice();
  
  useEffect(() => {
    if(!selectedDevice) return
    const db = getDatabase();
    const deviceref = ref(db, `controllers/${selectedDevice}/frequency`);
    
    onValue(deviceref, (snapshot) => {
      const fetchedData = snapshot.val();
      
      if (fetchedData) {
        const frequencyArray = Object.entries(fetchedData)
          .sort(([timestampA], [timestampB]) => timestampA.localeCompare(timestampB)) // Sort by timestamp string
          .map(([, value]) => value);
  
        const latestFrequencies = frequencyArray.slice(-10);
        
        setData(latestFrequencies);
      } else {
        console.error("Fetched data is not available:", fetchedData);
      }
    });
  
    return;
  }, [selectedDevice]);

  // // Weighted random function for generating frequency with a higher chance of getting 60
  // const generateFrequency = () => {
  //   const random = Math.random();
  //   if (random < 0.8) return 60; // 60% chance of 60
  //   return Math.random() < 0.5 ? 59 : 61; // 20% chance each of 58 or 62
  // };

  const formatDateKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // useEffect(() => {
  //   const db = getDatabase();
  //   const deviceref = ref(db, `controllers/${selectedDevice}/frequency`);
    
  //   const intervalId = setInterval(() => {
  //     const newFrequency = generateFrequency();
  //     const dateTimeKey = formatDateKey(); // Generate key in 'YYYY-MM-DD HH:MM:SS' format
      
  //     // Set the frequency with the formatted date-time as the key
  //     set(ref(db, `controllers/${selectedDevice}/frequency/${dateTimeKey}`), newFrequency)
  //       .then(() => {
  //         console.log(`Uploaded frequency: ${newFrequency} at ${dateTimeKey}`);
  //       })
  //       .catch((error) => {
  //         console.error("Error uploading frequency:", error);
  //       });
  //   }, 3000); // Run every 3 seconds

  //   return () => clearInterval(intervalId); // Cleanup on unmount
  // }, [selectedDevice]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Device Selected:</Text>
      <Text style={styles.deviceName}>{selectedDevice || "No Device Selected"}</Text>
      <Text style={styles.text}>Frequencies:</Text>
      <TouchableOpacity style={styles.chartContainer}>
        <LineChart
          data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{ data }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisMax={70}
          yAxisMin={50}
          yAxisSuffix="hz"
          chartConfig={{
            backgroundColor: '#22303c',
            backgroundGradientFrom: '#22303c',
            backgroundGradientTo: '#22303c',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          bezier
          style={styles.chart}
        />
      </TouchableOpacity>

      <View style={styles.tipsContainer}>
        <Text style={styles.text}>Tips:</Text>
        <Tips />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    marginTop: 50,
    alignSelf: 'left',
    marginLeft: 20,
    color: 'white',
  },
  deviceName: {
    color: "white",
    fontSize: 23,
    alignSelf: 'left',
    marginLeft: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#1b252d",
    alignItems: 'center',
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  tipsContainer: {
    width: '100%', 
    height: 250, 
    marginTop: 20,
    justifyContent: 'center', 
    alignItems: 'center',
  },
});

export default EnergySaved;
