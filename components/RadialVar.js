import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import { RadialSlider } from 'react-native-radial-slider';

const RadialVariant = ({ speed, setSpeed }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.sliderContainer, { transform: [{ scale }], opacity }]}>
        {/* Removed LinearGradient */}
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
      </Animated.View>
      <Animated.View style={[styles.infoContainer, { opacity }]}>
        <Text style={styles.infoText}>Slide to adjust temperature</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1b252d',
  },
  sliderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    overflow: 'hidden',
  },
  centerContentStyle: {
    paddingTop: 80,
    justifyContent: 'center',
    alignItems: 'center',
  }, 
  titleStyle: {
    color: '#FFFFFF', 
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  unitStyle: {
    color: '#FFFFFF',
    fontSize: 24,       
    textAlign: 'center',
    fontWeight: '300',
  },
  valueStyle: {
    color: '#FFFFFF',
    fontSize: 48,       
    textAlign: 'center',
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 20,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
  },
});

export default RadialVariant;
