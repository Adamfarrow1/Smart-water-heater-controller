import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import Homescreen from '../Screens/Homescreen';
import NotificationStack from '../nav/NotificationStack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../Screens/Homescreen';
import Notifications from '../Screens/Notifications';
import EditProfile from '../Screens/EditProfile';
// Stack for Home and Notifications
const Stack = createStackNavigator();

function HomeStack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Your Devices"
        component={Homescreen}
        options={({ navigation }) => ({
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#1b252d',
            borderBottomWidth: 0,
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={({navigation}) => navigation.openDrawer()}>
              <Ionicons name="menu" size={25} color="#fff" style={{ marginLeft: 15 }} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('NotificationStack')}>
              <Ionicons name="notifications" size={25} color="#fff" style={{ marginRight: 15 }} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="NotificationStack"
        component={NotificationStack}
      />
    </Stack.Navigator>
  );
}
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: 'black', // Drawer background color
          width: '75%', // Width of the drawer when opened halfway
        },
        headerStyle: {
            backgroundColor: '#1b252d', // Set header background color to black or any desired color
            borderBottomWidth: 0,
            shadowColor: 'transparent',
            elevation: 0,

          },
        drawerActiveTintColor: '#fff', // Text color when selected
        drawerInactiveTintColor: '#aaa', // Text color when not selected
        headerTintColor: '#fff'
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Notifications" component={Notifications} />
      <Drawer.Screen name="EditProfile" component={EditProfile} />
      {/* Add more drawer items here as needed */}
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;

