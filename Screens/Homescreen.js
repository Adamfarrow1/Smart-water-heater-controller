import { Button, View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList, Modal, TextInput } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import React, { useState, useEffect } from "react";
import { useUser } from "../context/userContext";
import { useNavigation } from '@react-navigation/native';
import BLEsetupStack from "../nav/BLEsetupStack";
import { getDatabase, ref, onValue } from "firebase/database";
import { useDevice } from '../context/DeviceContext';
/* Homescreen functionality */


const HomeScreen = () => {
    const { user, loading } = useUser();
    const { selectedDevice, setSelectedDevice, setDeviceInfo } = useDevice();
    const [open, setOpen] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState(null);
 //  const [selectedDevice, setSelectedDevice] = useState(null);
    const [devices, setDevices] = useState([]);
    const navigation = useNavigation();
    
useEffect(() => {
    if (user && user.uid) {
        const db = getDatabase();
        const devicesRef = ref(db, `users/${user.uid}/devices`); // Reference to the devices path
        console.log(devicesRef);
        // Listen for changes to the devices
        const unsubscribe = onValue(devicesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Convert the object of devices into an array
                const devicesArray = Object.entries(data).map(([key, value]) => ({
                    label: value.name || `Device ${key}`, // Use device name or fallback
                    value: key, // unique ID of the device
                }));
                setDevices(devicesArray); // Update state with the devices array

            } else {
                setDevices([]); // Clear devices if no data
            }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }
}, [user]);


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
                    items={devices} // Array of devices for the dropdown
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
                    // Key prop for the picker items
                    keyExtractor={item => item.id} // Ensure each item has a unique key
                />
                <Pressable style={styles.button}   onPress={() => navigation.navigate("SetupOptions")}>
                    <Text style={styles.buttonText}>Add Device</Text>
                </Pressable>
               
            </View>
            

            <Modal
                animationType="slide"
                transparent={true} // Make background semi-transparent
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}

            >
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Setup</Text>
                    
                        
                        <BLEsetupStack closeModal={() => setModalVisible(false)} />
                    
                    <Button title="Submit" onPress={() => { setModalVisible(false); }} />
                    <Button title="Cancel" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>

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
    modalContainer: {
        flex: 1,
        justifyContent: 'center', // Center the modal content
        alignItems: 'center', // Center the modal content
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    },
    modalView: {
        
        position: 'absolute',
        width: '80%',
        height: '60%', // Set a height to ensure it doesn't take full screen
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
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
