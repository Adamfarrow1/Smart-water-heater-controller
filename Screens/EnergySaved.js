import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ScrollView, SafeAreaView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getDatabase, ref, set, onValue } from "firebase/database";
import { useDevice } from '../context/DeviceContext';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

function EnergySaved() {
  const [data, setData] = useState([59, 60, 60, 60, 60, 61, 60, 60, 60 ,61]);
  const { selectedDevice, deviceInfo, setName, name } = useDevice();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      if (!selectedDevice) return;
      const db = getDatabase();
      const deviceref = ref(db, `controllers/${selectedDevice}/frequency`);
      
      const unsubscribe = onValue(deviceref, (snapshot) => {
        const fetchedData = snapshot.val();
        
        if (fetchedData) {
          const frequencyArray = Object.entries(fetchedData)
            .sort(([timestampA], [timestampB]) => timestampA.localeCompare(timestampB))
            .map(([, value]) => value);
    
          const latestFrequencies = frequencyArray.slice(-10);
          setData(latestFrequencies);
        }
      });
    
      return () => unsubscribe();
    }, [selectedDevice])
  );

  useFocusEffect(
    useCallback(() => {
      if (!selectedDevice) return;
      const db = getDatabase();
      const deviceref = ref(db, `controllers/${selectedDevice}/frequency`);
      
      const intervalId = setInterval(() => {
        const newFrequency = generateFrequency();
        const dateTimeKey = formatDateKey();
        
        set(ref(db, `controllers/${selectedDevice}/frequency/${dateTimeKey}`), newFrequency)
          .then(() => {
            console.log(`Uploaded frequency: ${newFrequency} at ${dateTimeKey}`);
          })
          .catch((error) => {
            console.error("Error uploading frequency:", error);
          });
      }, 3000);

      return () => clearInterval(intervalId);
    }, [selectedDevice])
  );

  const generateFrequency = () => {
    const random = Math.random();
    if (random < 0.8) return 60;
    return Math.random() < 0.5 ? 59 : 61;
  };

  const formatDateKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  };

  const TipCard = ({ icon, text, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.tipRow}>
      <Feather name={icon} size={20} color="#60a5fa" style={styles.tipIcon} />
      <Text style={styles.tipText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.deviceInfo}>
            <Feather name="thermometer" size={24} color="#ffffff" style={styles.icon} />
            <Text style={styles.deviceName}>
              {name || "No Device Selected"}
            </Text>
          </View>
          <Text style={styles.headerSubtitle}>Monitor your device's performance</Text>
        </View>

        {/* View All Frequencies Button using TipCard */}
        <TipCard 
          icon="zap"  // Using "zap" icon for the lightning bolt
          text="View All Frequencies"
          onPress={() => navigation.navigate('AllFrequencies')}
        />

        
          <Text style={styles.cardTitle}>Frequency Monitoring</Text>
          <LineChart
            data={{
              datasets: [{ data }],
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisSuffix="hz"
            chartConfig={{
              backgroundColor: '#1e293b',
              backgroundGradientFrom: '#1e293b',
              backgroundGradientTo: '#1e293b',
              color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "6", strokeWidth: "2", stroke: "#60a5fa" },
            }}
            bezier
            style={styles.chart}
          />

      
          <Text style={styles.cardTitle}>Energy Saving Tips</Text>
          <View style={styles.tipsContainer}>
            <TipCard
              icon="clock"
              text="Monitor frequency variations during peak hours to optimize energy consumption"
            />
            <TipCard
              icon="thermometer"
              text="Keep your device in optimal temperature range for better efficiency"
            />
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1b252d", paddingHorizontal: 20 },
  scrollContent: { padding: 20 },
  header: { marginBottom: 20 },
  deviceInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  icon: { marginRight: 10 },
  deviceName: { color: "#ffffff", fontSize: 18, fontWeight: '600' },
  headerSubtitle: { fontSize: 16, color: '#94a3b8' },
  card: { backgroundColor: 'rgba(40, 68, 104, 0.4)', borderRadius: 12, padding: 16, marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 16 },
  chart: { marginVertical: 8, borderRadius: 16 },
  tipsContainer: { gap: 16 },
  tipRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, backgroundColor: 'rgba(40, 68, 104, 0.4)', borderRadius: 8, paddingHorizontal: 12, marginBottom: 10 },
  tipIcon: { marginRight: 10 },
  tipText: { fontSize: 16, color: '#e2e8f0', fontWeight: '600' },
});

export default EnergySaved;
