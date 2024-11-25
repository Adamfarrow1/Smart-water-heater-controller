import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingPage from './Screens/Landing.js'; 
import Login from './Screens/Login.js';
import ForgotPassword from './Screens/ForgotPassword.js';
import Register from './Screens/Register.js';
import Homescreen from './Screens/Homescreen.js';
import LoggedinNavigator from './Screens/LoggedinNavigator.js'
import { AuthenticationContext } from './context/userContext.js';
import { DeviceProvider } from './context/DeviceContext';
import BLEdemo from './Screens/BLEdemo.js';
import AddDevice from './Screens/DeviceSetup/AddDevice.js';
import SetupOptions from './Screens/DeviceSetup/SetupOptions.js';
import DeviceInfo from './Screens/DeviceSetup/DeviceInfo.js';
import AllFrequencies from './Screens/Allfrequencies.js';
const Stack = createNativeStackNavigator();
  // entry for application includes navigator for different screens
const App = () => {
  return (
    
    <AuthenticationContext>
    <DeviceProvider>
       <NavigationContainer>
       
         <Stack.Navigator initialRouteName="Landing">
           <Stack.Screen name="Landing" component={LandingPage} options={{ headerShown: false }} />
           <Stack.Screen name="Login" component={Login} options={{ headerStyle: {
            backgroundColor: '#1b252d',
          },
          headerTintColor: '#ffffff',
          headerTitle: '', 
          headerBackTitleVisible: false, }} />
           <Stack.Screen name="Register" component={Register} options={{headerStyle: {
            backgroundColor: '#1b252d', 
          },
          headerTintColor: '#ffffff', 
          headerTitle: '', 
          headerBackTitleVisible: false, }} />
           <Stack.Screen name="Home" component={LoggedinNavigator} options={{ headerShown: false,gestureEnabled: false }} />
           <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
           <Stack.Screen name="BLEdemo" component={BLEdemo} options={{headerStyle: {
            backgroundColor: '#1b252d', 
          },
          headerTintColor: '#ffffff', 
          headerTitle: 'Device Setup', 
          headerBackTitleVisible: false, }} />
           <Stack.Screen name="AddDevice" component={AddDevice} options={{headerStyle: {
            backgroundColor: '#1b252d', 
          },
          headerTintColor: '#ffffff', 
          headerTitle: 'Add Device', 
          headerBackTitleVisible: false, }} />
           <Stack.Screen name="DeviceInfo" component={DeviceInfo} options={{headerStyle: {
            backgroundColor: '#1b252d', 
          },
          headerTintColor: '#ffffff', 
          headerTitle: 'Device Info', 
          headerBackTitleVisible: false, }} />
           <Stack.Screen name="SetupOptions" component={SetupOptions} options={{headerStyle: {
            backgroundColor: '#1b252d', 
          },
          headerTintColor: '#ffffff', 
          headerTitle: 'Device Setup', 
          headerBackTitleVisible: false, }} />
           <Stack.Screen name="AllFrequencies" component={AllFrequencies} options={{
          headerStyle: {
            backgroundColor: '#1b252d',
          },
          headerTintColor: '#ffffff',
          headerTitle: '', 
          headerBackTitleVisible: false,
        }} />

         </Stack.Navigator>
       </NavigationContainer>
       </DeviceProvider>
    </AuthenticationContext>
  );
};

export default App;