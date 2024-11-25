import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  Button,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ESPProvisionManager, ESPDevice, ESPTransport, ESPSecurity } from '@orbital-systems/react-native-esp-idf-provisioning';
import { useUser } from "../context/userContext";
import { getDatabase, ref, onValue, update, database } from 'firebase/database';
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';


const BLEdemo = () => {

  //declaring state variables
  const { user, loading } = useUser();
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [userDevices, setUserDevices] = useState({});
  const [isWifiLoading, setIsWifiLoading] = useState(false); // Loading state for Wi-Fi credentials
  const [isSettingUp, setIsSettingUp] = useState(false); // Loading state for setup completion
  const navigation = useNavigation(); 



  //scanning for devices function
  const scanForDevices = async () => {
    try {
      setIsScanning(true);
      const prefix = '';
      const transport = ESPTransport.ble;
      const security = ESPSecurity.secure2;

      const foundDevices = await ESPProvisionManager.searchESPDevices(prefix, transport, security);

      if (foundDevices.length === 0) {
        Alert.alert('No Devices Found', 'No BLE devices found.');
      } else {
        setDevices(foundDevices);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', `Failed to scan for devices: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };


  //connecting to the device
  const connectToDevice = async () => {
    if (!selectedDevice) return;

    try {
      setIsWifiLoading(true); // Show Wi-Fi loading

      //security: must match with the esp32
      await selectedDevice.connect("abcd1234");

      
      await selectedDevice.provision(ssid, password);
      Alert.alert('Success', 'Wi-Fi credentials sent successfully!');
      setIsWifiLoading(false); // Hide Wi-Fi loading
      setIsSettingUp(true); // Show setup loading

      await selectedDevice.disconnect();
      const uid = user?.uid;
   
      await sendUIDToESP32(uid);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', `Failed to provision device: ${error.message}`);
    }
  };

//sending the UID to the ESP32
  const sendUIDToESP32 = async (uid) => {
    const data = { uid: uid };
    try {
        const response = await fetch(`http://esp32.local/receiveUID`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });


        const responseText = await response.text();
   

        if (response.ok) {
          setModalVisible(false)
            const responseBody = JSON.parse(responseText);
         
            const deviceId = responseBody.deviceId;
            
            navigation.navigate('DeviceInfo', { deviceId: deviceId});
            setIsSettingUp(false); // Hide setup loading
        } else {
            console.error("Failed to send UID. Status:", response.status);
        }
    } catch (error) {
        console.error("Error sending UID to ESP32:", error);
    }
};

  //show the wifi modal
  const showWifiDialog = (device) => {
    setSelectedDevice(device);
    setModalVisible(true);
  };
  return (
    <SafeAreaView style={styles.container}>

      {/* flatlist displaying the devices found */}
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Connect to ESP32 via Bluetooth</Text>
              <Text style={styles.subtitle}>Scan and connect to nearby ESP32 devices</Text>
            </View>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={scanForDevices}
              disabled={isScanning}
            >
              <View style={styles.scanButtonContent}>
                {isScanning ? (
                  <ActivityIndicator color="#ffffff" style={styles.scanButtonIcon} />
                ) : (
                  <Feather name="bluetooth" size={24} color="#ffffff" style={styles.scanButtonIcon} />
                )}
                <Text style={styles.scanButtonText}>
                  {isScanning ? 'Scanning...' : 'Scan for Devices'}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        }
        data={devices}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.deviceItem}
            onPress={() => showWifiDialog(item)}
          >
            <View style={styles.deviceInfo}>
              <Ionicons name="hardware-chip-outline" size={24} color="#3498db" style={styles.deviceIcon} />
              <View>
                <Text style={styles.deviceName}>{item.name}</Text>
              </View>
            </View>
            <Feather name="wifi" size={24} color="#2ecc71" />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.flatListContent}
      />
 {/* modal displaying the loading indicator and entering wifi credentials  */}
<Modal
  animationType="fade"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      {isWifiLoading ? (
        <><Text style={styles.loadingText}>Sending WiFi credentials...</Text><ActivityIndicator size="large" color="#ffffff" /></>
      ) : isSettingUp ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Almost done setting up...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.modalTitle}>Enter Wi-Fi Credentials</Text>
          <TextInput
            style={styles.textInput}
            placeholder="SSID"
            placeholderTextColor="#bdc3c7"
            value={ssid}
            onChangeText={setSsid}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Password"
            placeholderTextColor="#bdc3c7"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={connectToDevice}
            >
              <Text style={styles.modalButtonText}>Connect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  </View>
</Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b252d',
  },
  header: {
    marginBottom: 30,
    marginTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  scanButton: {
    backgroundColor: '#3498db',
    borderRadius: 15,
    marginBottom: 30,
    overflow: 'hidden',
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  scanButtonIcon: {
    marginRight: 10,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    marginBottom: 15,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    marginRight: 15,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  deviceId: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#2c3e50',
    borderRadius: 20,
    padding: 25,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    width: '100%',
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#34495e',
    borderRadius: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: 'rgba(40, 68, 104, 1)',
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    marginLeft: 10,
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 16,
  },
})

export default BLEdemo;