import React from 'react';
import { ImageBackground, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import home_bg from '../assets/home_bg.jpg';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
const LandingPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ImageBackground source={home_bg} resizeMode="cover" style={styles.image}>
        <LinearGradient colors={['transparent', 'rgba(0,0,0.5,0.8)']} style={styles.gradient}>
          <View style={styles.mainContainer}>
            <Text style={styles.title}>Smart Water Heater Controller</Text>
            <Text style={styles.subtitle}>Control all your smart devices and save energy</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.gettingStartedButton]} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.buttonText}>Getting started</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.buttonText} >Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    width: '80%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    marginTop: 500,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  gettingStartedButton: {
    backgroundColor: '#6EBEFF',
  },
  loginButton: {
    backgroundColor: '#E5F3FF',
  },
  buttonText: {
    color: '#171717',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LandingPage;
