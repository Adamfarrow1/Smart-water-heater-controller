import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { RadialSlider } from 'react-native-radial-slider';

const RadialVariant = ({ initialSpeed = 0, min = 0, max = 120 }) => {
  const [speed, setSpeed] = useState(initialSpeed);

  return (
    <View style={styles.container}>
      <RadialSlider 
        markerCircleSize={500}
        radius={150}
        subTitle=""
        value={speed} 
        min={min} 
        max={max} 
        onChange={setSpeed}
        title="Temperature"
        unit='°F'
        unitStyle={styles.unitStyle}
        thumbColor="#FFFFFF"
        startAngle={150}
        stroke="#FFFFFF"
        titleStyle={styles.titleStyle}  // Assuming `titleStyle` can be applied
        valueStyle={styles.valueStyle}
        contentStyle={styles.contentStyle}
        centerContentStyle={styles.centerContentStyle}
        sliderWidth={30}
        linearGradient={[
            { offset: '0%', color: '#62B6F9' },
            { offset: '100%', color: '#ff2c2c' }
          ]}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1b252d',
    color: '#FFFFFF'
  },
  centerContentStyle: {
    paddingTop: 80,  // General padding around the content
    justifyContent: 'center',  // Center the content
    alignItems: 'center',      // Center the content
    
  }, 
  titleStyle: {
    color: '#FFFFFF', 
    fontSize: '25',
  },
  unitStyle: {
    color: '#FFFFFF',
    fontSize: 50,       
    textAlign: 'center', 
  },
  valueStyle: {
    color: '#FFFFFF',
    fontSize: 50,       
    textAlign: 'center',
  },
  
});
export default RadialVariant;
