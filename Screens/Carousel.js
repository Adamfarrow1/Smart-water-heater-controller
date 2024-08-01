import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Swiper from 'react-native-deck-swiper';

const initialData = [
  { id: '1', text: 'Tip: Use a programmable thermostat to adjust your heating schedule according to your daily routines.' },
  { id: '2', text: 'Tip: Schedule regular maintenance for your heating system.'},
  { id: '3', text: 'Tip: Improve insulation in your home to prevent heat loss.'},
  { id: '4', text: 'Tip: Use a programmable thermostat to adjust your heating schedule according to your daily routines.' },
  { id: '5', text: 'Tip: Utilize our stochastic filter to analyze and manage your energy usage patterns.'},
];

const { width, height } = Dimensions.get('window');

const Tips = () => {
  const [data, setData] = useState(initialData);
  const [cardIndex, setCardIndex] = useState(0);
  const [swiperKey, setSwiperKey] = useState(0); // Add a key state
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initialize fade animation

  useEffect(() => {
    console.log("rerender")
    // Fade in animation when the component first renders
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000, // Duration of the fade-in animation
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSwipedAll = () => {
    // Animate fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1, // Duration of the fade-out animation
      useNativeDriver: true,
    }).start(() => {
      // Reset data to initialData when all cards are swiped
      setData([...initialData]);
      setCardIndex(0); // Reset the card index to 0
      setSwiperKey(prevKey => prevKey + 1); // Update key to force re-render

      // Animate fade in after resetting data
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000, // Duration of the fade-in animation
        useNativeDriver: true,
      }).start();
    });
  };

  // Fade-in effect
  const fadeInStyle = {
    opacity: fadeAnim,
  };

  return (
    <Animated.View style={[styles.swiperContainer, fadeInStyle]}>
      <Swiper
        key={swiperKey} // Use key to force re-render
        cards={data}
        renderCard={(card) => (
          <View style={styles.card}>
            <Text style={styles.text}>{card.text}</Text>
          </View>
        )}
        onSwipedAll={handleSwipedAll}
        cardIndex={cardIndex}
        backgroundColor={'transparent'}
        stackSize={5}
        loop={false} // Turn off loop to rely on custom handling
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  swiperContainer: {
    width: "100%", // Adjust the width to fit the container
    height: 250, // Fixed height for swiper container
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    backgroundColor: '#1b252d',
  },
  text: {
    fontSize: 22,
    color: '#fff', // Changed text color to ensure visibility on dark card background
    marginTop: 10,
  },
});

export default Tips;
