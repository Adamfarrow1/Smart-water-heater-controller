import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Notifications from '../Screens/Notifications';

const Stack = createStackNavigator();

function NotificationsStack() {
    return (
        <Stack.Navigator>
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

export default NotificationsStack;
