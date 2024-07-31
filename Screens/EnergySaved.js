import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

function EnergySaved() {
  const [data, setData] = useState([60, 60, 60, 60, 60, 60]);

  // Generate random number between min and max
  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Update data function
  const updateData = () => {
    const newData = data.map(() => getRandomNumber(57, 63));
    setData(newData);
  };

  // Function to determine color for each dot based on value
  const getDotProps = (value) => ({
    r: '6',
    strokeWidth: '2',
    stroke: value === 60 ? 'green' : 'red',
    fill: value === 60 ? 'green' : 'red',
  });

  return (
    <TouchableOpacity style={styles.container} onPress={updateData}>
      <View style={styles.container}>
        <LineChart
          data={{
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [{ data }],
          }}
          width={Dimensions.get('window').width - 40} // from react-native
          height={220}
          yAxisMax={70}
          yAxisMin={50}
          yAxisSuffix="hz"
          yAxisInterval={1} // optional, defaults to 1
          chartConfig={{
            backgroundColor: 'transparent',
            decimalPlaces: 0, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: data.map(value => getDotProps(value)),
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b252d",
    alignItems: 'center',
  },
});

export default EnergySaved;
