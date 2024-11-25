import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { getDatabase, ref, set } from 'firebase/database';
import { useUser } from '../../context/userContext';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const DeviceInfo = ({ route }) => {
    //state variables
    const { deviceId } = route.params;
    const { user } = useUser();
    const [deviceName, setDeviceName] = useState('');
    const [zipCode, setZipCode] = useState('');
    const navigation = useNavigation();
    // handles submit and updates the device infromation in the DB
    const handleSubmit = () => {
        if (!deviceName.trim() || !zipCode.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        
        const db = getDatabase();
        const userId = user.uid;
        const deviceRef = ref(db, `users/${userId}/devices/${deviceId}`);



        const deviceData = {
            name: deviceName,
            zipCode: zipCode,
        };


            set(deviceRef, deviceData)
            .then(() => {
                Alert.alert('Success', 'Device information saved successfully!');
                navigation.navigate('Home');
            })
            .catch((error) => {
                console.error("Error writing to database: ", error);
                Alert.alert('Error', 'Could not save device information. Please try again.');
            });
    };

    return (
        <SafeAreaView style={styles.container}>
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                {/* text inputs fro the device information */}
                <View style={styles.content}>
                    <Text style={styles.title}>Enter Device Information</Text>
                    <View style={styles.inputContainer}>
                        <Feather name="smartphone" size={24} color="#bdc3c7" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Device Name"
                            placeholderTextColor="#bdc3c7"
                            value={deviceName}
                            onChangeText={setDeviceName}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Feather name="map-pin" size={24} color="#bdc3c7" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Zip Code"
                            placeholderTextColor="#bdc3c7"
                            value={zipCode}
                            onChangeText={setZipCode}
                            keyboardType="numeric"
                        />
                    </View>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
//styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1b252d',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 10,
        width: '100%',
        maxWidth: 300,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#ffffff',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: 'rgba(40, 68, 104, 1)',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginTop: 20,
        width: '100%',
        maxWidth: 300,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default DeviceInfo;