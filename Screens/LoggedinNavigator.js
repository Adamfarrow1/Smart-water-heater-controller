import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Homescreen from './Homescreen';
import Login from './Login';

const Tab = createBottomTabNavigator();

function Home() {
    return (
        <Tab.Navigator initialRouteName="Your Devices"
        screenOptions={{
            headerTitleAlign: 'center',
            headerStyle: {
                backgroundColor: '#1b252d',
                borderBottomWidth: 0,
                shadowColor: 'transparent',
                elevation: 0,
            },
            headerTintColor: '#fff',


            tabBarStyle: {
                backgroundColor: '#1b252d',
                borderTopWidth: 0, 
                shadowColor: 'transparent',
                elevation: 0,
                borderTopColor: 'transparent'
            },

            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#aaa',

        }}>
            <Tab.Screen name="Your Devices" component={Homescreen} />
            <Tab.Screen name="Temp" component={Login} />
        </Tab.Navigator>
    );
}

export default Home;
