import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Swiper from 'react-native-deck-swiper';

const initialData = [
  { id: '1', text: 'Tip 1: Use a programmable thermostat to adjust your heating schedule according to your daily routines.' },
  { id: '2', text: 'Tip 2: Schedule regular maintenance for your heating system.'},
  { id: '3', text: 'Tip 3: Improve insulation in your home to prevent heat loss.'},
  { id: '4', text: 'Tip 4: Use a programmable thermostat to adjust your heating schedule according to your daily routines.' },
  { id: '5', text: 'Tip 5: Utilize our stochastic filter to analyze and manage your energy usage patterns.'},
];

const { width, height } = Dimensions.get('window');

const Tips = () => {
  const [data, setData] = useState(initialData);
  const [cardIndex, setCardIndex] = useState(0);
  const [swiperKey, setSwiperKey] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSwipedAll = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1,
      useNativeDriver: true,
    }).start(() => {
      setData([...initialData]);
      setCardIndex(0); 
      setSwiperKey(prevKey => prevKey + 1);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    });
  };

  const fadeInStyle = {
    opacity: fadeAnim,
  };

  return (
    <Animated.View style={[styles.swiperContainer, fadeInStyle]}>
      <Swiper
        key={swiperKey}
        cards={data}
        renderCard={(card) => (
          <View style={styles.card}>
            <Text style={styles.text}>{card.text}</Text>
          </View>
        )}
        onSwipedAll={handleSwipedAll}
        cardIndex={cardIndex}
        backgroundColor={'transparent'}
        stackSize={2}
        loop={true}
        animateCardOpacity={false}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  swiperContainer: {
    width: "100%",
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
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
    color: '#fff',
    marginTop: 10,
  },
});

export default Tips;
