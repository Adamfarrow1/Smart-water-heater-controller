import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Tips from './Carousel';
import { getDatabase, ref, onValue } from "firebase/database";
function EnergySaved() {
  const [data, setData] = useState([60, 60, 60, 60, 60, 60]);

  useEffect(() => {
    const db = getDatabase();
    const deviceref = ref(db, 'controllers/device_002');
    onValue(deviceref, (snapshot) => {
      const data = snapshot.val();
      setData(data.frequency);
    });
  
    return;
  }, []);
  

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Device Selected:</Text>
      <Text style={styles.deviceName}>Home device</Text>
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
