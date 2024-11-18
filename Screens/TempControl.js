import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { getDatabase, ref, onValue, update } from "firebase/database";
import { useDevice } from '../context/DeviceContext';
import RadialVariant from '../components/RadialVar';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

function TempControl() {
  const { selectedDevice, deviceInfo,setName, name } = useDevice();
  const [currentTemp, setCurrentTemp] = useState(120);
  const [setTemp, setSetTemp] = useState(120);

  useFocusEffect(
    useCallback(() => {
      if (!selectedDevice) return;
      const db = getDatabase();
      const deviceRef = ref(db, `controllers/${selectedDevice}`);
      const unsubscribe = onValue(deviceRef, (snapshot) => {
        const data = snapshot.val();
        if (data && typeof data.set_temperature === 'number') {
          setCurrentTemp(data.set_temperature);
          setSetTemp(data.set_temperature);
        } else if (!data.set_temperature) {
          //console.warn("Invalid temperature data from Firebase");
          changeTemp();
          setCurrentTemp(120);
          setSetTemp(120);
        }
      });

      return () => unsubscribe();
    }, [selectedDevice])
  );

  function changeTemp() {
    if (!selectedDevice) return;
    if (setTemp === currentTemp) return;
    const db = getDatabase();
    const updates = {};
    updates[`controllers/${selectedDevice}/set_temperature`] = setTemp;
    update(ref(db), updates).catch((error) => {
      console.error('Error updating temperature:', error);
    });

    setCurrentTemp(setTemp);
    setSetTemp(setTemp);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.deviceInfo}>
            <Feather name="thermometer" size={24} color="#ffffff" style={styles.icon} />
            <Text style={styles.deviceName}>
              {name || "No Device Selected"}
            </Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.tempInfo}>
            <Text style={styles.label}>Current Temperature</Text>
            <Text style={styles.temperature}>{currentTemp}°F</Text>
          </View>

          <RadialVariant speed={setTemp} setSpeed={setSetTemp} />

          <TouchableOpacity style={styles.button} onPress={changeTemp}>
            <Text style={styles.buttonText}>Set Temperature</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b252d",
    paddingBottom: 20,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  deviceName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: '600',
  },
  tempInfo: {
    backgroundColor: 'rgba(40, 68, 104, 0.4)',
    borderRadius: 15,
    padding: 20,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 5,
    opacity: 0.8,
  },
  temperature: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  radialContainer: {
    alignItems: 'center',
  },
  caption: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 15,
  },
  button: {
    backgroundColor: 'rgba(40, 68, 104, 0.4)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingVertical: 10,
  },
});

export default TempControl;
