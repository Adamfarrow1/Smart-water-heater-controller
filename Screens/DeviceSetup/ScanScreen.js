import React, { useState } from 'react';
import { View, Text, Alert, Button, Modal, TextInput, StyleSheet, FlatList } from 'react-native';
import {
  ESPProvisionManager,
  ESPDevice,
  ESPTransport,
  ESPSecurity,
} from '@orbital-systems/react-native-esp-idf-provisioning';
 // delete this file
const ScanScreen = () => {

    const [devices, setDevices] = useState([]);
    const [isScanning, setIsScanning] = useState(false);



}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    deviceItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    deviceText: {
      fontSize: 16,
    },
  });

export default ScanScreen;