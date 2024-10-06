import { Button, View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList, Modal, TextInput } from "react-native";
import React, { useState, useEffect } from "react";
import { useUser } from "../context/userContext";
import { useNavigation } from '@react-navigation/native';
import BLEsetupStack from "../nav/BLEsetupStack";
/* Homescreen functionality */


const HomeScreen = () => {
    const { user, loading } = useUser();
    const [modalVisible, setModalVisible] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const navigation = useNavigation();
    

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
                <Pressable style={styles.button}  onPress={() => setModalVisible(true)}>
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        
    }
});

export default HomeScreen;
