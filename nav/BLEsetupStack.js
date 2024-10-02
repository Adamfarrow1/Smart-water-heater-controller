import React from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator();

const InstructionScreen = ({ navigation }) => {
    console.log(navigation);
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Instructions</Text>
            <Text style={styles.instructions}>
                Make sure your Smart Water Heater controller device is powered on.{'\n'}
                We will start by scanning for nearby Bluetooth devices.{'\n'}
                Select the device named "ESP32_SWHC" from the list.{'\n'}
                Next, choose your Wi-Fi network and enter its credentials.{'\n'}
                Lastly, wait for the ESP32 to connect successfully to the network.
            </Text>
                <Button
                    title="Next"
                    onPress={() => {
                        console.log("should go next ;(");
                        navigation.navigate('ScanScreen');
                    }}
                />
            
        </View>
    );
};

const ScanScreen = ({ navigation, devices, isScanning, scanForDevices }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Look for ESP32_SWHC</Text>
            <Button title={isScanning ? 'Scanning...' : 'Scan for Devices'} onPress={scanForDevices} disabled={isScanning} />
            <FlatList
                data={devices}
                keyExtractor={(item) => item.identifier}
                renderItem={({ item }) => (
                    <View style={styles.deviceItem}>
                        <Text style={styles.deviceText}>{item.name || 'Unnamed Device'}</Text>
                        <Text style={styles.deviceText}>ID: {item.identifier}</Text>
                    </View>
                )}
            />
            <View style={styles.buttonContainer}>
                <Button title="Previous" onPress={() => navigation.navigate('InstructionScreen')} />
                
            </View>
        </View>
    );
};
const BLEsetupStack = ({ closeModal }) => {
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
               
                <Stack.Screen name="ScanScreen">
                    {(props) => (
                        <ScanScreen 
                            {...props} 
                            devices={devices} 
                            isScanning={isScanning} 
                            scanForDevices={scanForDevices} 
                            closeModal={closeModal} 
                        />
                    )}
                </Stack.Screen>
                <Stack.Screen name="InstructionScreen" component={InstructionScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    instructions: {
        fontSize: 14,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '100%',
    },
});

export default BLEsetupStack;
