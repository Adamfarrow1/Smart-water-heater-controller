import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import Homescreen from './Homescreen';
import Login from './Login';
import Notifications from './Notifications';
import TempControl from './TempControl';
import EnergySaved from './EnergySaved';
import Schedule from './Schedule';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack(){
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
                    headerLeft: () => null,
                    headerRight: () => (
                        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                            <Ionicons name="notifications" size={25} color="#fff" style={{ marginRight: 15 }} />
                        </TouchableOpacity>
                    ),
                })}
            />
             <Stack.Screen 
                name="Notifications" 
                component={Notifications} 
                options={{
                    headerTitle: 'Notifications',
                    headerStyle: {
                        backgroundColor: '#1b252d',
                    },
                    headerTintColor: '#fff',
                }}
            />
            
        </Stack.Navigator>
    );
}

function Home() {
    return (
        <Tab.Navigator 
            initialRouteName="Your Devices"
            screenOptions={({ route }) => {
                const headerOptions = route.name === 'Your Devices' ? { headerShown: false } : {
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

                        if (route.name === 'Your Devices') {
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
                name="Your Devices" 
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
