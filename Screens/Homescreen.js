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
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import { getStorage, ref as storageRef, getDownloadURL } from "firebase/storage";
import { useDevice } from '../context/DeviceContext';
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { Alert } from "react-native";

const HomeScreen = () => {
  const { user, loading } = useUser();
  const { selectedDevice, setSelectedDevice, setDeviceInfo, deviceInfo, setName, name } = useDevice();
  const [open, setOpen] = useState(false);
  const [batteryPercentage, setBatteryPercentage] = useState(null);
  const [controllerStatus, setControllerStatus] = useState(null);
  const [gridStatus, setGridStatus] = useState(null);
  const [devices, setDevices] = useState([]);
  const [gridAttachmentStatus, setGridAttachmentStatus] = useState(null);
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
      const gridAttachmentRef = ref(db, `controllers/${selectedDevice}/gridAttachment`);
      
      const unsubscribeStatus = onValue(statusRef, (snapshot) => {
        const status = snapshot.val();
        setControllerStatus(status);
      });

      const unsubscribeGridStatus = onValue(gridStatusRef, (snapshot) => {
        const status = snapshot.val();
        setGridStatus(status);
      });

      const unsubscribeBattery = onValue(batteryRef, (snapshot) => setBatteryPercentage(snapshot.val()));

      const unsubscribeGridAttachment = onValue(gridAttachmentRef, async (snapshot) => {
        const attachmentUrl = snapshot.val();
        if (attachmentUrl) {
          try {
            const storage = getStorage();
            const attachmentRef = storageRef(storage, attachmentUrl);
            const downloadURL = await getDownloadURL(attachmentRef);
            const response = await fetch(downloadURL);
            const attachmentContent = await response.text();
            setGridAttachmentStatus(attachmentContent);
          } catch (error) {
            console.error("Error fetching grid attachment:", error);
            setGridAttachmentStatus(null);
          }
        } else {
          setGridAttachmentStatus(null);
        }
      });

      return () => {
        unsubscribeStatus();
        unsubscribeGridStatus();
        unsubscribeBattery();
        unsubscribeGridAttachment();
      };
    }
  }, [selectedDevice]);

  const toggleController = () => {
    if (selectedDevice) {
      const db = getDatabase();
      const statusRef = ref(db, `controllers/${selectedDevice}/status`);
      
      const newStatus = !controllerStatus;
      
      set(statusRef, newStatus).catch(error => {
        console.error("Error toggling controller:", error);
      });
    }
  };


  const deleteDevice = () => {
    if (!selectedDevice) {
      Alert.alert("Error", "Please select a device to delete.");
      return;
    }

    Alert.alert(
      "Delete Device",
      "Are you sure you want to delete this device?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            const db = getDatabase();
            const deviceRef = ref(db, `users/${user.uid}/devices/${selectedDevice}`);
            remove(deviceRef)
              .then(() => {
                setSelectedDevice(null);
                setDeviceInfo(null);
                setName(null);
                Alert.alert("Success", "Device deleted successfully.");
              })
              .catch((error) => {
                console.error("Error deleting device:", error);
                Alert.alert("Error", "Failed to delete device. Please try again.");
              });
          },
          style: "destructive"
        }
      ]
    );
  };

  const getControllerStatusText = () => {
    if (controllerStatus === null || gridStatus === null) {
      return "Unknown Status";
    }
    
    if (!controllerStatus) {
      return "Standby: Controller is OFF";
    }
    
    if (controllerStatus && !gridStatus) {
      return "Standby: OFF due to Grid Condition";
    }
    
    if (controllerStatus && gridStatus) {
      return "Controller is ON";
    }
    
    return "Unknown Status";
  };

  const getStatusColor = () => {
    if (controllerStatus === null || gridStatus === null) {
      return '#767577'; // Gray for unknown status
    }
    
    if (!controllerStatus) {
      return '#FF5252'; // Red for off
    }
    
    if (controllerStatus && !gridStatus) {
      return '#FFA726'; // Orange for grid condition
    }
    
    if (controllerStatus && gridStatus) {
      return '#4CAF50'; // Green for on
    }
    
    return '#767577'; // Gray for unknown status
  };

  const getBatteryIcon = () => {
    if (batteryPercentage >= 75) return "battery-full";
    if (batteryPercentage >= 50) return "battery-three-quarters";
    if (batteryPercentage > 25) return "battery-half";
    if (batteryPercentage > 0) return "battery-quarter";
    return "battery-empty";
  };

  const getGridStatusMessage = () => {
    if (gridStatus === false) {
      return "The water heater is temporarily turned off to solve frequency issues.";
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" size="small" />
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
            setValue={setSelectedDevice}
            onChangeValue={(value) => {
              console.log("Selected value:", value);
              const selected = devices.find(device => device.value === value);
              console.log("Selected device object:", selected);

              if (selected) {
                console.log("Setting name to:", selected.label);
                setName(selected.label);
                setDeviceInfo(selected);
              } else {
                console.warn("No matching device found!");
              }
            }}
            placeholder={'Select a device'}
            containerStyle={[styles.dropdownContainer, open && styles.dropdownOpen]}
            style={styles.dropdown}
            listMode="SCROLLVIEW"
            dropDownContainerStyle={styles.dropdownList}
            textStyle={styles.dropdownText}
            placeholderStyle={styles.dropdownPlaceholder}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("SetupOptions")}>
              <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
              <Text style={styles.buttonText}>Add Device</Text>
            </TouchableOpacity>
            {selectedDevice && (
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteDevice(selectedDevice)}>
                <Ionicons name="trash-outline" size={24} color="#ffffff" />
                <Text style={styles.buttonText}>Delete Device</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {controllerStatus !== null && (
          <View style={styles.statusContainer}>
            {getGridStatusMessage() && (
              <View style={styles.gridStatusMessageCard}>
                <Ionicons name="warning-outline" size={24} color="#FFD700" style={styles.warningIcon} />
                <Text style={styles.gridStatusMessageText}>{getGridStatusMessage()}</Text>
              </View>
            )}

            <View style={styles.statusCard}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
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

            {batteryPercentage !== null && (
              <View style={styles.batteryCard}>
                <FontAwesome name={getBatteryIcon()} size={24} color="#ffffff" />
                <Text style={styles.batteryText}>Battery: {batteryPercentage}%</Text>
              </View>
            )}

            {gridAttachmentStatus && (
              <View style={styles.gridAttachmentCard}>
                <Text style={styles.gridAttachmentTitle}>Grid Attachment Status:</Text>
                <Text style={styles.gridAttachmentContent}>{gridAttachmentStatus}</Text>
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
    zIndex: 1000,
  },
  dropdownContainer: {
    height: 50,
    marginBottom: 20,
    zIndex: 10,
  },
  dropdownOpen: {
    zIndex: 1000,
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
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: "#ffffff",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  addButtonText: {
    color: "#ffffff",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusContainer: {
    marginTop: 20,
    zIndex: 1,
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
  gridAttachmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  gridAttachmentTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  gridAttachmentContent: {
    color: "#ffffff",
    fontSize: 14,
  },
  gridStatusMessageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  gridStatusMessageText: {
    flex: 1,
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
  warningIcon: {
    marginRight: 10,
  },
});

export default HomeScreen;

