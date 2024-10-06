import 'react-native-gesture-handler';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import HomeStack from '../nav/HomeStack'
import TempControl from './TempControl';
import EnergySaved from './EnergySaved';
import Schedule from './Schedule';

const Tab = createBottomTabNavigator();

function Home() {
    return (
        <Tab.Navigator 
            initialRouteName="Your Devices home"
            screenOptions={({ route }) => {
                const headerOptions = route.name === 'Your Devices home' ? { headerShown: false } : {
                    headerTitleAlign: 'center',
                    headerStyle: {
                        backgroundColor: '#1b252d',
                        borderBottomWidth: 0,
                        shadowColor: 'transparent',
                        elevation: 0,
                    },
                    headerTintColor: '#fff',
                };

                return {
                    ...headerOptions,
                    tabBarStyle: {
                        position: 'absolute',
                        backgroundColor: '#1b252d',
                        borderTopWidth: 0, 
                        shadowColor: 'transparent',
                        elevation: 0,
                        borderTopColor: 'transparent',
                    },
                    tabBarActiveTintColor: '#fff',
                    tabBarInactiveTintColor: '#aaa',
                    tabBarIcon: ({ color, size }) => {
                        let icon;

                        if (route.name === 'Your Devices home') {
                            icon = 'home'; 
                        } else if (route.name === 'Schedule') {
                            icon = 'calendar'; 
                        } else if (route.name === 'Energy Saved') {
                            icon = 'flash'; 
                        } else if (route.name === 'Temperature Control') {
                            icon = 'thermometer'; 
                        }

                        return <Ionicons name={icon} size={size} color={color} />;
                    },
                };
            }}
        >
            <Tab.Screen 
                name="Your Devices home" 
                component={HomeStack} 
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen 
                name="Schedule" 
                component={Schedule} 
            />
            <Tab.Screen 
                name="Energy Saved" 
                component={EnergySaved} 
                options={{ tabBarActiveTintColor: '#18de43' }} 
            />
            <Tab.Screen 
                name="Temperature Control" 
                component={TempControl} 
                options={{ tabBarLabel: 'Temperature' }} 
            />
        </Tab.Navigator>
    );
}

export default Home;
