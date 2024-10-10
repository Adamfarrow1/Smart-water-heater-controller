import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingPage from './Screens/Landing.js'; 
import Login from './Screens/Login.js';
import ForgotPassword from './Screens/ForgotPassword.js';
import Register from './Screens/Register.js';
import Homescreen from './Screens/Homescreen.js';
import BLEsetup from './components/BLEsetup.js';
import LoggedinNavigator from './Screens/LoggedinNavigator.js'
import { AuthenticationContext } from './context/userContext.js';
import BLEdemo from './Screens/BLEdemo.js';
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    
    <AuthenticationContext>
      {/* <NavigationContainer>
      <LoggedinNavigator></LoggedinNavigator>
      </NavigationContainer> */}
       <NavigationContainer>
       
         <Stack.Navigator initialRouteName="Landing">
           <Stack.Screen name="Landing" component={LandingPage} options={{ headerShown: false }} />
           <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
           <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
           <Stack.Screen name="Home" component={LoggedinNavigator} options={{ headerShown: false,gestureEnabled: false }} />
           <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
           {/*<Stack.Screen name="BLEsetup" component={BLEsetup} options={{title: 'Device Setup' }} />*/}
           <Stack.Screen name="BLEdemo" component={BLEdemo} options={{title: 'Device Setup' }} />
         </Stack.Navigator>
       </NavigationContainer>
    </AuthenticationContext>
  );
};

export default App;


/* <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />*/