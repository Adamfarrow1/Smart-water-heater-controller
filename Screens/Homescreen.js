import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList, Modal, TextInput, TouchableOpacity, Switch } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import React, { useState, useEffect } from "react";
import { useUser } from "../context/userContext";
import { useNavigation } from '@react-navigation/native';
import BLEsetupStack from "../nav/BLEsetupStack";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { useDevice } from '../context/DeviceContext';
import { Ionicons, FontAwesome } from "@expo/vector-icons";


const HomeScreen = () => {
    const { user, loading } = useUser();
    const { selectedDevice, setSelectedDevice, setDeviceInfo } = useDevice();
    const [open, setOpen] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const [batteryPercentage, setBatteryPercentage] = useState(null);
    const [controllerStatus, setControllerStatus] = useState(null);
    const [gridStatus, setGridStatus] = useState(null);
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
            const gridStatusRef = ref(db, `controllers/${selectedDevice}/gridStatus`); // Firebase path for grid status
            const batteryRef = ref(db, `controllers/${selectedDevice}/battery`);
            
            // Listen for status and gridStatus updates
            const unsubscribeStatus = onValue(statusRef, (snapshot) => setControllerStatus(snapshot.val()));
            const unsubscribeGridStatus = onValue(gridStatusRef, (snapshot) => setGridStatus(snapshot.val()));  // Update grid status
            const unsubscribeBattery = onValue(batteryRef, (snapshot) => setBatteryPercentage(snapshot.val()));

            return () => {
                unsubscribeStatus();
                unsubscribeGridStatus();
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

    const getControllerStatusText = () => {
        if (controllerStatus && gridStatus) {
            return "Controller is ON";
        } else if (!controllerStatus) {
            return "Standby: Controller is OFF";
        } else if (controllerStatus && !gridStatus) {
            return "Standby: Grid Condition - Controller is OFF";
        }
        return "Unknown Status";
    };

    const getBatteryIcon = () => {
        if (batteryPercentage >= 75) return "battery-full";
        if (batteryPercentage >= 50) return "battery-three-quarters";
        if (batteryPercentage > 25) return "battery-half";
        if (batteryPercentage > 0) return "battery-quarter";
        return "battery-empty";
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
                <TouchableOpacity style={styles.button}   onPress={() => navigation.navigate("SetupOptions")}>
                    <Text style={styles.buttonText}>Add Device</Text>
                    <Ionicons name="add-circle" size={24} color="#1b252d" /> 
                </TouchableOpacity>
               
            </View>
            
            {controllerStatus !== null && (
                <View style={styles.statusContainer}>
                    <View style={styles.onOffContainer}>
                    <Text style={styles.statusText}>{getControllerStatusText()}</Text>
                    <View style={styles.circle} />
                    </View>
                    {controllerStatus && batteryPercentage !== null && (
                         <View style={styles.batteryContainer}>
                         <FontAwesome name={getBatteryIcon()} size={24} color="white" />
                         <Text style={styles.batteryText}>Battery: {batteryPercentage}%</Text>
                     </View>
                        
                    )}
                    <TouchableOpacity style={styles.toggleButton} onPress={toggleController}>
                        <Text style={styles.toggleButtonText}>{controllerStatus ? "Turn Off" : "Turn On"}</Text>
                        <Switch
                            trackColor={{false: '#767577', true: '#81b0ff'}}
                            thumbColor={controllerStatus ? '#f4f3f4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitch}
                            value={controllerStatus}
                        />
                    </TouchableOpacity> 
        
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
        marginTop: 20,
        marginLeft: 20
    },
    greeting1: {
        color: "white",
        fontSize: 18
    },
    greeting2: {
        color: "white",
        fontSize: 23
    },
    devicesContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        marginBottom: 10,
    },
    button: {
        flexDirection: 'row',  // Added for icon + text layout
        alignItems: 'center',  // Center the icon and text
        backgroundColor: "white",
        borderRadius: 10,
        marginTop: 25,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    buttonText: {
        color: "#1b252d",
        marginLeft: 8,  // Space between icon and text
        fontSize: 16,
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
   // backgroundColor: 'rgba(40, 68, 104, 0.4)', // Semi-transparent blue
    padding: 15,
    borderRadius: 10,
    },
    statusText: {
        color: "white",
        fontSize: 14,
        fontWeight: 25,
    },
    onOffContainer: {
        alignItems: 'center',
        marginVertical: 20,
        backgroundColor: 'rgba(40, 68, 104, 0.4)', // Semi-transparent blu
        borderRadius: 10,
        shadowRadius: 3.5,
        flexDirection: 'row',  // Added for icon + text layout
        width: 330,
        height: 73,
        padding: 26,
        gap: 30,
        borderRadius: 20
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'green',
      },
    toggleButton: {
        flexDirection: 'row',  // Added for icon + text layout
        alignItems: 'center',  // Center the icon and text
        backgroundColor: "white",
        width: 330,
        height: 73,
        padding: 26,
        gap: 30,
        borderRadius: 20
    },
    toggleButtonText: {
        color: "#1b252d",
        fontSize: 16,
        fontWeight: 700,
    },
    batteryContainer: {
        alignItems: 'center',
        marginVertical: 20,
        backgroundColor: 'rgba(240,240,240,0.1)', // Semi-transparent blu
        borderRadius: 10,
        shadowRadius: 3.5,
        flexDirection: 'row',  // Added for icon + text layout
        width: 330,
        height: 73,
        padding: 26,
        gap: 30,
        borderRadius: 20
    },
    batteryText: {
        color: "white",
        fontSize: 16,
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
        fontSize: 16,
        alignSelf: 'left',

        color: 'white',
        fontWeight: '600'
      }

});

export default HomeScreen;
