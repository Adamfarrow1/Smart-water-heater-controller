import { StatusBar } from 'expo-status-bar';
import { Button, ImageBackground, StyleSheet, Text, View, Animated, Easing, TouchableOpacity} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import home_bg from './assets/home_bg.jpg';

export default function App() {
  return (

    <View style={styles.container}>
      <ImageBackground source={home_bg} 
      resizeMode="cover" 
      style={styles.image}>
         <LinearGradient colors={['transparent','rgba(0,0,0.5,0.8)']} style={styles.gradient}>
      <View style={styles.mainContainer}>
      <Text style={styles.title}>Smart Water Heater Controller</Text>
      <Text style={styles.subtitle}>Control all your smart devices and save energy</Text>
      <View style={styles.buttonContainer}>
      <TouchableOpacity style={[styles.button, styles.gettingStartedButton]}>
            <Text style={styles.buttonText}>Getting started</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.loginButton]}>
            <Text style={styles.buttonText}>Log In</Text>
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

  mainContainer: {
    width: '80%',
    alignItems: 'center',
    //backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 10,
    marginTop:500,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 20
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
