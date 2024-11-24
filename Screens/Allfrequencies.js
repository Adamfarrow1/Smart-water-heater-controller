import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { getDatabase, ref, get, set, query, orderByKey, startAt, endAt } from "firebase/database";
import { useDevice } from '../context/DeviceContext';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePickerModal from "react-native-modal-datetime-picker";

function AllFrequencies() {
  const [frequencies, setFrequencies] = useState([]);
  const [displayedFrequencies, setDisplayedFrequencies] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date().setHours(0, 0, 0, 0));
  const [endTime, setEndTime] = useState(new Date().setHours(23, 59, 59, 999));
  const [isFromDatePickerVisible, setFromDatePickerVisibility] = useState(false);
  const [isToDatePickerVisible, setToDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showingAnomalous, setShowingAnomalous] = useState(false);
  const { selectedDevice } = useDevice();
  const scrollViewRef = useRef(null);

  const ITEMS_PER_PAGE = 50;
  const [currentPage, setCurrentPage] = useState(1);

  const showFromDatePicker = () => setFromDatePickerVisibility(true);
  const hideFromDatePicker = () => setFromDatePickerVisibility(false);
  const showToDatePicker = () => setToDatePickerVisibility(true);
  const hideToDatePicker = () => setToDatePickerVisibility(false);
  const showStartTimePicker = () => setStartTimePickerVisibility(true);
  const hideStartTimePicker = () => setStartTimePickerVisibility(false);
  const showEndTimePicker = () => setEndTimePickerVisibility(true);
  const hideEndTimePicker = () => setEndTimePickerVisibility(false);

  const handleConfirmFromDate = (date) => {
    hideFromDatePicker();
    setFromDate(date);
    fetchFrequencies(date, toDate, new Date(startTime), new Date(endTime), showingAnomalous);
  };

  const handleConfirmToDate = (date) => {
    hideToDatePicker();
    setToDate(date);
    fetchFrequencies(fromDate, date, new Date(startTime), new Date(endTime), showingAnomalous);
  };

  const handleConfirmStartTime = (time) => {
    hideStartTimePicker();
    setStartTime(time.getTime());
    fetchFrequencies(fromDate, toDate, time, new Date(endTime), showingAnomalous);
  };

  const handleConfirmEndTime = (time) => {
    hideEndTimePicker();
    setEndTime(time.getTime());
    fetchFrequencies(fromDate, toDate, new Date(startTime), time, showingAnomalous);
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

  const fetchFrequencies = useCallback((from = fromDate, to = toDate, start = new Date(startTime), end = new Date(endTime), anomalous = showingAnomalous) => {
    if (!selectedDevice) return;
    setIsLoading(true);
    const db = getDatabase();
    const deviceRef = ref(db, `controllers/${selectedDevice}/frequency`);
    
    const startAtDate = formatDateTimeForQuery(from, start);
    const endAtDate = formatDateTimeForQuery(to, end);

    const frequencyQuery = query(
      deviceRef,
      orderByKey(),
      startAt(startAtDate),
      endAt(endAtDate)
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

          setFrequencies(sortedFrequencies);
          setCurrentPage(1);
          updateDisplayedFrequencies(sortedFrequencies, 1);
        } else {
          setFrequencies([]);
          setDisplayedFrequencies([]);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data from Firebase:", error);
        setIsLoading(false);
      });
  }, [selectedDevice, sortOrder, fromDate, toDate, startTime, endTime, showingAnomalous]);

  const updateDisplayedFrequencies = (allFrequencies, page) => {
    const endIndex = page * ITEMS_PER_PAGE;
    setDisplayedFrequencies(allFrequencies.slice(0, endIndex));
  };

  useEffect(() => {
    fetchFrequencies();
  }, [selectedDevice, sortOrder, fromDate, toDate, startTime, endTime, showingAnomalous]);

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
    const sortedFrequencies = sortFrequencies([...frequencies], newSortOrder);
    setFrequencies(sortedFrequencies);
    setCurrentPage(1);
    updateDisplayedFrequencies(sortedFrequencies, 1);
  };

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  const filterAnomalous = () => {
    const newShowingAnomalous = !showingAnomalous;
    setShowingAnomalous(newShowingAnomalous);
    fetchFrequencies(fromDate, toDate, new Date(startTime), new Date(endTime), newShowingAnomalous);
    scrollToTop();
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

  const renderFrequencyItem = (item) => (
    <View key={item.timestamp} style={styles.frequencyItem}>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
      <Text style={styles.value}>{item.value} Hz</Text>
    </View>
  );

  const loadMore = () => {
    if (displayedFrequencies.length < frequencies.length) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      updateDisplayedFrequencies(frequencies, nextPage);
    }
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
      </View>

      <View style={styles.dateRangeContainer}>
        <TouchableOpacity onPress={showFromDatePicker} style={styles.dateButton}>
          <Feather name="calendar" size={20} color="#ffffff" />
          <Text style={styles.dateButtonText}>{fromDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <Text style={styles.dateRangeSeparator}>to</Text>
        <TouchableOpacity onPress={showToDatePicker} style={styles.dateButton}>
          <Feather name="calendar" size={20} color="#ffffff" />
          <Text style={styles.dateButtonText}>{toDate.toLocaleDateString()}</Text>
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
        isVisible={isFromDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmFromDate}
        onCancel={hideFromDatePicker}
        themeVariant="light"
      />

      <DateTimePickerModal
        isVisible={isToDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmToDate}
        onCancel={hideToDatePicker}
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

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {displayedFrequencies.length === 0 ? (
          <Text style={styles.noData}>No frequency data available</Text>
        ) : (
          displayedFrequencies.map(renderFrequencyItem)
        )}
        {isLoading && (
          <View style={styles.loadingFooter}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
        {!isLoading && displayedFrequencies.length < frequencies.length && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={loadMore}
          >
            <Text style={styles.loadMoreButtonText}>Load More</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    padding:
10,
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
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 68, 104, 0.4)',
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  dateButtonText: {
    color: 'white',
    marginLeft: 10,
  },
  dateRangeSeparator: {
    color: 'white',
    marginHorizontal: 10,
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
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
  loadMoreButton: {
    backgroundColor: 'rgba(40, 68, 104, 0.6)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loadMoreButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default AllFrequencies;

