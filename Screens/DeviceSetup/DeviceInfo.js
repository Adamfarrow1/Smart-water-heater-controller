import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, set } from 'firebase/database';
import { useUser } from '../../context/userContext';
import { useNavigation } from '@react-navigation/native';

const DeviceInfo = ({ route }) => {
    const { deviceId } = route.params; // Get deviceId from navigation params
    const { user } = useUser();
    const [deviceName, setDeviceName] = useState('');
    const [zipCode, setZipCode] = useState('');
    const navigation = useNavigation();

    const handleSubmit = () => {
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
        <View style={styles.container}>
            <Text style={styles.title}>Enter Device Information</Text>
            <TextInput
                style={styles.input}
                placeholder="Device Name"
                value={deviceName}
                onChangeText={setDeviceName}
            />
            <TextInput
                style={styles.input}
                placeholder="Zip Code"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="numeric"
            />
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 15,
        paddingLeft: 10,
    },
});

export default DeviceInfo;
