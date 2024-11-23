import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { getDatabase, ref, get, set, query, limitToLast, orderByKey, startAt, endAt } from "firebase/database";
import { useDevice } from '../context/DeviceContext';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const ITEMS_PER_FETCH = 50;

function AllFrequencies() {
  const [frequencies, setFrequencies] = useState([]);
  const [allFrequencies, setAllFrequencies] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date().setHours(0, 0, 0, 0));
  const [endTime, setEndTime] = useState(new Date().setHours(23, 59, 59, 999));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showingAnomalous, setShowingAnomalous] = useState(false);
  const { selectedDevice } = useDevice();
  const flatListRef = useRef(null);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const showStartTimePicker = () => setStartTimePickerVisibility(true);
  const hideStartTimePicker = () => setStartTimePickerVisibility(false);
  const showEndTimePicker = () => setEndTimePickerVisibility(true);
  const hideEndTimePicker = () => setEndTimePickerVisibility(false);
  
  const handleConfirmDate = (date) => {
    hideDatePicker();
    setSelectedDate(date);
    fetchFrequencies(date, new Date(startTime), new Date(endTime), showingAnomalous);
  };

  const handleConfirmStartTime = (time) => {
    hideStartTimePicker();
    setStartTime(time.getTime());
    fetchFrequencies(selectedDate, time, new Date(endTime), showingAnomalous);
  };

  const handleConfirmEndTime = (time) => {
    hideEndTimePicker();
    setEndTime(time.getTime());
    fetchFrequencies(selectedDate, new Date(startTime), time, showingAnomalous);
  };

  const removeDuplicates = (data) => {
    const uniqueData = [];
    const seenTimestamps = new Set();

    for (const item of data) {
      if (!seenTimestamps.has(item.timestamp)) {
        seenTimestamps.add(item.timestamp);
        uniqueData.push(item);
      }
    }

    return uniqueData;
  };

  const formatDateTimeForQuery = (date, time) => {
    const d = new Date(date);
    d.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const fetchFrequencies = useCallback((date = selectedDate, start = new Date(startTime), end = new Date(endTime), anomalous = showingAnomalous) => {
    if (!selectedDevice) return;
    setIsLoading(true);
    const db = getDatabase();
    const deviceRef = ref(db, `controllers/${selectedDevice}/frequency`);
    
    const startAtDate = formatDateTimeForQuery(date, start);
    const endAtDate = formatDateTimeForQuery(date, end);

    const frequencyQuery = query(
      deviceRef,
      orderByKey(),
      startAt(startAtDate),
      endAt(endAtDate),
      limitToLast(ITEMS_PER_FETCH)
    );

    get(frequencyQuery)
      .then((snapshot) => {
        const fetchedData = snapshot.val();
        if (fetchedData) {
          let frequencyArray = Object.entries(fetchedData)
            .map(([timestamp, value]) => ({ timestamp, value }))
            .reverse();

          if (anomalous) {
            frequencyArray = frequencyArray.filter(item => item.value !== 60);
          }

          const uniqueFrequencies = removeDuplicates(frequencyArray);
          const sortedFrequencies = sortFrequencies(uniqueFrequencies, sortOrder);

          setAllFrequencies(sortedFrequencies);
          setFrequencies(sortedFrequencies);
        } else {
          setAllFrequencies([]);
          setFrequencies([]);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data from Firebase:", error);
        setIsLoading(false);
      });
  }, [selectedDevice, sortOrder, selectedDate, startTime, endTime, showingAnomalous]);

  useEffect(() => {
    fetchFrequencies();
  }, [selectedDevice, sortOrder, selectedDate, startTime, endTime, showingAnomalous]);

  const sortFrequencies = (data, order) => {
    return data.sort((a, b) => {
      return order === 'asc'
        ? a.timestamp.localeCompare(b.timestamp)
        : b.timestamp.localeCompare(a.timestamp);
    });
  };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setFrequencies(sortFrequencies([...frequencies], newSortOrder));
  };

  const filterAnomalous = () => {
    const newShowingAnomalous = !showingAnomalous;
    setShowingAnomalous(newShowingAnomalous);
    fetchFrequencies(selectedDate, new Date(startTime), new Date(endTime), newShowingAnomalous);
  };

  useFocusEffect(
    useCallback(() => {
      if (!selectedDevice) return;
      const db = getDatabase();
      const intervalId = setInterval(() => {
        const newFrequency = generateFrequency();
        const dateTimeKey = formatDateKey();
  
        set(ref(db, `controllers/${selectedDevice}/frequency/${dateTimeKey}`), newFrequency)
          .then(() => console.log(`Uploaded frequency: ${newFrequency} at ${dateTimeKey}`))
          .catch(error => console.error("Error uploading frequency:", error));
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

  const renderItem = ({ item }) => (
    <View style={styles.frequencyItem}>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
      <Text style={styles.value}>{item.value} Hz</Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>All Frequencies</Text>
        <TouchableOpacity onPress={() => fetchFrequencies()} style={styles.refreshButton}>
          <Feather name="refresh-cw" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={handleSortToggle} style={styles.sortButton}>
          <Feather name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={20} color="#ffffff" />
          <Text style={styles.sortButtonText}>Sort by Time</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
          <Feather name="calendar" size={20} color="#ffffff" />
          <Text style={styles.dateButtonText}>{selectedDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeRangeContainer}>
        <TouchableOpacity onPress={showStartTimePicker} style={styles.timeButton}>
          <Feather name="clock" size={20} color="#ffffff" />
          <Text style={styles.timeButtonText}>{new Date(startTime).toLocaleTimeString()}</Text>
        </TouchableOpacity>
        <Text style={styles.timeRangeSeparator}>to</Text>
        <TouchableOpacity onPress={showEndTimePicker} style={styles.timeButton}>
          <Feather name="clock" size={20} color="#ffffff" />
          <Text style={styles.timeButtonText}>{new Date(endTime).toLocaleTimeString()}</Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        themeVariant="light"
      />

      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmStartTime}
        onCancel={hideStartTimePicker}
        themeVariant="light"
      />

      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmEndTime}
        onCancel={hideEndTimePicker}
        themeVariant="light"
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={filterAnomalous} style={styles.filterButton}>
          <Feather name="filter" size={20} color="#ffffff" />
          <Text style={styles.filterButtonText}>
            {showingAnomalous ? "Show All Data" : "Show Anomalous Data"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={frequencies}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        contentContainerStyle={styles.scrollContainer}
        ListEmptyComponent={<Text style={styles.noData}>No frequency data available</Text>}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b252d",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 68, 104, 0.4)',
    padding: 10,
    borderRadius: 8,
  },
  sortButtonText: {
    color: '#ffffff',
    marginLeft: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 68, 104, 0.4)',
    padding: 10,
    borderRadius: 8,
  },
  dateButtonText: {
    color: 'white',
    marginLeft: 10,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 68, 104, 0.4)',
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  timeButtonText: {
    color: 'white',
    marginLeft: 10,
  },
  timeRangeSeparator: {
    color: 'white',
    marginHorizontal: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 68, 104, 0.6)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  filterButtonText: {
    color: '#ffffff',
    marginLeft: 10,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  frequencyItem: {
    backgroundColor: "rgba(40, 68, 104, 0.4)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    color: "#ffffff",
    fontSize: 14,
  },
  value: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 'bold',
  },
  noData: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default AllFrequencies;

