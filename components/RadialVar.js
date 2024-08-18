import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { RadialSlider } from 'react-native-radial-slider';

const RadialVariant = () => {
  const [speed, setSpeed] = useState(0);

  return (
    <View style={styles.container}>
      <RadialSlider 
        markerCircleSize={500}
        radius={150}
        subTitle=""
        value={speed} 
        min={120} 
        max={140} 
        onChange={setSpeed}
        title="Temperature"
        unit="°F"
        unitStyle={styles.unitStyle}
        isHideTailText={true}
        thumbColor="#FFFFFF"
        stroke="#FFFFFF"
        titleStyle={styles.titleStyle} 
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
