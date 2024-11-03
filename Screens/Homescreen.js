import { Button, View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList, Modal, TextInput, TouchableOpacity, Switch } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import React, { useState, useEffect } from "react";
import { useUser } from "../context/userContext";
import { useNavigation } from '@react-navigation/native';
import BLEsetupStack from "../nav/BLEsetupStack";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { useDevice } from '../context/DeviceContext';

const HomeScreen = () => {
    const { user, loading } = useUser();
    const { selectedDevice, setSelectedDevice, setDeviceInfo } = useDevice();
    const [open, setOpen] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const [batteryPercentage, setBatteryPercentage] = useState(null);
    const [controllerStatus, setControllerStatus] = useState(null);
    const [devices, setDevices] = useState([]);
    const navigation = useNavigation();
    const toggleSwitch = () => setControllerStatus(previousState => !previousState);
    
useEffect(() => {
    if (user && user.uid) {
        const db = getDatabase();
        const devicesRef = ref(db, `users/${user.uid}/devices`);
        // Listen for changes to the devices
        const unsubscribe = onValue(devicesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const devicesArray = Object.entries(data).map(([key, value]) => ({
                    label: value.name || `Device ${key}`, // Use device name or deviceId
                    value: key, // deviceId
                }));
                setDevices(devicesArray);

            } else {
                setDevices([]); 
            }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }
}, [user]);

useEffect(() => {
    if (selectedDevice) {
        const db = getDatabase();
        const statusRef = ref(db, `controllers/${selectedDevice}/status`);
        const unsubscribeStatus = onValue(statusRef, (snapshot) => {
            setControllerStatus(snapshot.val());
        });

        // Listen for battery percentage if the device is on
        const batteryRef = ref(db, `controllers/${selectedDevice}/battery`);
        const unsubscribeBattery = onValue(batteryRef, (snapshot) => {
            setBatteryPercentage(snapshot.val());
        });

        return () => {
            unsubscribeStatus();
            unsubscribeBattery();
        };
    }
}, [selectedDevice]);

    const toggleController = () => {
        if (selectedDevice) {
            const db = getDatabase();
            const statusRef = ref(db, `controllers/${selectedDevice}/status`);
            set(statusRef, !controllerStatus);  // Toggle the current status
        }
    };


    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.greetingContainer}>
                <Text style={styles.greeting1}>Good afternoon,</Text>
                <Text style={styles.greeting2}>{user.displayName != null ? user.displayName : "User"}</Text>
            </View>

            <View style={styles.devicesContainer}>
            <Text style={styles.text}>Device Selected: {devices.find(device => device.value === selectedDevice)?.label || "Select a device"}</Text>
                <DropDownPicker
                    open={open}
                    value={selectedDevice}
                    items={devices}
                    setOpen={setOpen}
                    setValue={(value) => {
                        const selected = devices.find(device => device.value === value);
                        setSelectedDevice(value); // Update selected device in context
                        setDeviceInfo(selected); // Set the selected device's info in context
                    }}
                    placeholder={'Select a device'}
                    containerStyle={{ height: 40 }}
                    style={{ backgroundColor: '#fafafa' }}
                    dropDownContainerStyle={{ backgroundColor: '#fafafa' }}
                    keyExtractor={item => item.id} // Ensure each item has a unique key
                />
                <Pressable style={styles.button}   onPress={() => navigation.navigate("SetupOptions")}>
                    <Text style={styles.buttonText}>Add Device</Text>
                </Pressable>
               
            </View>
            
            {controllerStatus !== null && (
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>
                        {controllerStatus ? "Status: CONTROLLER IS ON" : "STAND BY: CONTROLLER IS OFF"}
                    </Text>
                    {controllerStatus && batteryPercentage !== null && (
                        <Text style={styles.batteryText}>
                            Battery: {batteryPercentage}%
                        </Text>
                    )}
                    <TouchableOpacity style={styles.toggleButton} onPress={toggleController}>
                        <Text style={styles.toggleButtonText}>
                            {controllerStatus ? "Turn Off" : "Turn On"}
                        </Text>
                    </TouchableOpacity>
                    <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={controllerStatus ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={controllerStatus}
          text="TUrn on"
        />
                </View>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#1b252d"
    },
    greetingContainer: {
        marginTop: 50,
        marginLeft: 20
    },
    greeting1: {
        color: "white",
        fontSize: 13
    },
    greeting2: {
        color: "white",
        fontSize: 23
    },
    devicesContainer: {

        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        marginBottom: 100,
    },
    button: {
        backgroundColor: "white",
        borderRadius: 10,
        marginTop: 15
    },
    buttonText: {
        color: "#1b252d",
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 20,
        marginRight: 20,
    },
    noDeviceText: {
        color: "white"
    },
    deviceText: {
        color: "black",
        fontSize: 16,
        marginBottom: 10
    },
    statusContainer: {
        alignItems: 'center',
        marginVertical: 20,
        backgroundColor: '#333', // Adding a background color for better shadow visibility
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
    },
    statusText: {
        color: "white",
        fontSize: 16,
        marginBottom: 10,
        fontWeight: 25,
    },
    toggleButton: {
        backgroundColor: "white",
        padding: 10,
        borderRadius: 10
    },
    toggleButtonText: {
        color: "#1b252d",
        fontSize: 16
    },
    batteryText: {
        color: "white",
        fontSize: 16,
        marginBottom: 10
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        width: 250
    },
    buttonClose: {
        backgroundColor: "#2196F3",
        marginTop: 15,
    },
    buttonSubmit: {
        backgroundColor: "#4CAF50",
        
    },
    text:{
        fontSize: 15,
        alignSelf: 'left',
        marginLeft: 20,
        color: 'white',
        fontWeight: '600'
      }

});

export default HomeScreen;
