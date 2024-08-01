import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Tips from './Carousel';

function EnergySaved() {
  const [data, setData] = useState([60, 60, 60, 60, 60, 60]);

  const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const updateData = () => {
    const newData = data.map(() => getRandomNumber(57, 63));
    setData(newData);
  };

  return (
    <View style={styles.container}>
          <Text style={styles.text}>Device Selected:</Text>
          <Text style={styles.deviceName}>Home device</Text>
      <Text style={styles.text}>Frequencies:</Text>
      <TouchableOpacity style={styles.chartContainer} onPress={updateData}>
        
        <LineChart
          data={{
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [{ data }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisMax={70}
          yAxisMin={50}
          yAxisSuffix="hz"
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#22303c', // New chart background color
            backgroundGradientFrom: '#22303c',
            backgroundGradientTo: '#22303c', // Optional: Gradient end color
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
  text:{
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
    backgroundColor: "#1b252d", // Container background color
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
    width: '100%', // Ensure width fits within the screen
    height: 250, // Set a fixed height for the carousel
    marginTop: 20,
    justifyContent: 'center', // Center carousel vertically if needed
    alignItems: 'center', // Center carousel horizontally if needed
  },
});

export default EnergySaved;
