import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
} from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';
import { useUser } from "../context/userContext";
import { useNavigation } from '@react-navigation/native';
import { getDatabase, ref, onValue, set } from "firebase/database";
import { useDevice } from '../context/DeviceContext';
import { Ionicons, FontAwesome } from "@expo/vector-icons";

const HomeScreen = () => {
  const { user, loading } = useUser();
  const { selectedDevice, setSelectedDevice, setDeviceInfo } = useDevice();
  const [open, setOpen] = useState(false);
  const [batteryPercentage, setBatteryPercentage] = useState(null);
  const [controllerStatus, setControllerStatus] = useState(null);
  const [gridStatus, setGridStatus] = useState(null);
  const [devices, setDevices] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (user && user.uid) {
      const db = getDatabase();
      const devicesRef = ref(db, `users/${user.uid}/devices`);
      const unsubscribe = onValue(devicesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const devicesArray = Object.entries(data).map(([key, value]) => ({
            label: value.name || `Device ${key}`,
            value: key,
          }));
          setDevices(devicesArray);
        } else {
          setDevices([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (selectedDevice) {
      const db = getDatabase();
      const statusRef = ref(db, `controllers/${selectedDevice}/status`);
      const gridStatusRef = ref(db, `controllers/${selectedDevice}/gridStatus`);
      const batteryRef = ref(db, `controllers/${selectedDevice}/battery`);
      
      const unsubscribeStatus = onValue(statusRef, (snapshot) => setControllerStatus(snapshot.val()));
      const unsubscribeGridStatus = onValue(gridStatusRef, (snapshot) => setGridStatus(snapshot.val()));
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
      set(statusRef, !controllerStatus);
    }
  };

  const getControllerStatusText = () => {
    if (controllerStatus && gridStatus) {
      return "Controller is ON";
    } else if (!controllerStatus) {
      return "Standby: Controller is OFF";
    } else if (controllerStatus && !gridStatus) {
      return "Standby:OFF due to Grid Condition";
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good afternoon,</Text>
          <Text style={styles.userName}>{user && user.displayName ? user.displayName : "User"}</Text>
        </View>

        <View style={styles.devicesContainer}>
          <Text style={styles.sectionTitle}>Selected Device</Text>
            <DropDownPicker
            open={open}
            value={selectedDevice}
            items={devices}
            setOpen={setOpen}
            setValue={(value) => {
                const selected = devices.find(device => device.value === value);
                setSelectedDevice(value);
                setDeviceInfo(selected);
            }}
            placeholder={'Select a device'}
            containerStyle={[styles.dropdownContainer, open && styles.dropdownOpen]}
            style={styles.dropdown}
            listMode="SCROLLVIEW"
            dropDownContainerStyle={styles.dropdownList}
            textStyle={styles.dropdownText}
            placeholderStyle={styles.dropdownPlaceholder}
            />

          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("SetupOptions")}>
            <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Device</Text>
          </TouchableOpacity>
        </View>
        
        {controllerStatus !== null && (
          <View style={styles.statusContainer}>
            <View style={styles.statusCard}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: controllerStatus ? '#4CAF50' : '#FF5252' }]} />
                <Text style={styles.statusText}>{getControllerStatusText()}</Text>
              </View>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={controllerStatus ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleController}
                value={controllerStatus}
              />
            </View>

            {controllerStatus && batteryPercentage !== null && (
              <View style={styles.batteryCard}>
                <FontAwesome name={getBatteryIcon()} size={24} color="#ffffff" />
                <Text style={styles.batteryText}>Battery: {batteryPercentage}%</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#1b252d",
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    header: {
      marginBottom: 30,
    },
    greeting: {
      color: "#ffffff",
      fontSize: 18,
      opacity: 0.8,
    },
    userName: {
      color: "#ffffff",
      fontSize: 28,
      fontWeight: "bold",
    },
    sectionTitle: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 10,
    },
    devicesContainer: {
      marginBottom: 30,
      zIndex: 1000, // Ensure the dropdown remains above other elements
    },
    dropdownContainer: {
      height: 50,
      marginBottom: 20,
      zIndex: 10, // Default lower zIndex
    },
    dropdownOpen: {
      zIndex: 1000, // Higher zIndex when dropdown is open
    },
    dropdown: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    dropdownList: {
      backgroundColor: '#2a3b4d',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    dropdownText: {
      color: '#ffffff',
    },
    dropdownPlaceholder: {
      color: 'rgba(255, 255, 255, 0.5)',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 10,
      padding: 15,
    },
    addButtonText: {
      color: "#ffffff",
      marginLeft: 10,
      fontSize: 16,
      fontWeight: "600",
    },
    statusContainer: {
      marginTop: 20,
      zIndex: 1, // Ensure it stays below the dropdown when open
    },
    statusCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'rgba(40, 68, 104, 0.4)',
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 10,
    },
    statusText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
    },
    batteryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 15,
      padding: 20,
    },
    batteryText: {
      color: "#ffffff",
      fontSize: 16,
      marginLeft: 15,
    },
  });
  

export default HomeScreen;