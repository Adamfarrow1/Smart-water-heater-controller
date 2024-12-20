import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import Homescreen from '../Screens/Homescreen';
import NotificationStack from '../nav/NotificationStack';
import HomeScreen from '../Screens/Homescreen';
import Notifications from '../Screens/Notifications';
import EditProfile from '../Screens/EditProfile';
import { signOut } from 'firebase/auth';
import { auth } from '../context/firebaseConfig';
import { useDevice } from '../context/DeviceContext';
const Stack = createStackNavigator();

function HomeStack({ navigation }) {
  //home screen stack navigator used for drawer on homescreen
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
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
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

function CustomDrawerContent(props) {
  //custom content for logout used in drawer
  const {setDeviceInfo , setSelectedDevice } = useDevice();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSelectedDevice(null)
      setDeviceInfo({})
      props.navigation.navigate('Landing');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ flexGrow: 1 }}>
        <DrawerItemList {...props} />
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}


function DrawerNavigator() {
  // drawer navigator declaration
  return (
    // declare custom drawer content
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#1b252d',
          width: '75%',
        },
        headerStyle: {
          backgroundColor: '#1b252d',
          borderBottomWidth: 0,
          shadowColor: 'transparent',
          elevation: 0,
        },
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#aaa',
        headerTintColor: '#fff',
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Notifications" component={Notifications} />
      <Drawer.Screen name="Edit Profile" component={EditProfile} />
    </Drawer.Navigator>
  );
}
//styles
const styles = StyleSheet.create({
  logoutButton: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(40, 68, 104, 1)',
    alignItems: 'center',
    marginBottom: 100,
    width: "70%",
    alignSelf: "center",
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});



export default DrawerNavigator;
