import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import Homescreen from '../Screens/Homescreen';
import NotificationStack from '../nav/NotificationStack';

/* Home, Notifications, Settings */
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
                    headerLeft: () => ( 
                        <TouchableOpacity>
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
                options={{ headerShown: false }} // Hide header as NotificationsStack handles its own header
            />
        </Stack.Navigator>
    );
}
export default HomeStack;