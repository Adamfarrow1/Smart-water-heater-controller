import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet, SafeAreaView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function Component({ navigation }) {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');

  const scanForDevices = () => {
    setIsScanning(true);
    // Simulating device discovery
    setTimeout(() => {
      setDevices([
        { id: '1', name: 'ESP32-Device1' },
        { id: '2', name: 'ESP32-Device2' },
      ]);
      setIsScanning(false);
    }, 2000);
  };

  const showWifiDialog = (device) => {
    setSelectedDevice(device);
    setModalVisible(true);
  };

  const connectToDevice = async () => {
    if (!selectedDevice) return;
    try {
      console.log(`Connecting to device: ${selectedDevice.name}`);
      console.log(`SSID: ${ssid}, Password: ${password}`);

      // Simulating device connection and provisioning
      await new Promise(resolve => setTimeout(resolve, 2000));

      setModalVisible(false);
      navigation.navigate('DeviceInfo', { deviceId: selectedDevice.id });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', `Failed to provision device: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        keyExtractor={(item) => item.id}
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
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
    backgroundColor: '#2ecc71',
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
})