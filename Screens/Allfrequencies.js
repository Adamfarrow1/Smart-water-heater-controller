import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { getDatabase, ref, get ,set } from "firebase/database";
import { useDevice } from '../context/DeviceContext';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePickerModal from "react-native-modal-datetime-picker";

function AllFrequencies() {
  const [frequencies, setFrequencies] = useState([]);
  const [allFrequencies, setAllFrequencies] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchFrequency, setSearchFrequency] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const { selectedDevice } = useDevice();

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  
  const handleConfirm = (date) => {
    hideDatePicker();
    setSelectedDate(date);
  
    const filteredFrequencies = allFrequencies.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate.toDateString() === date.toDateString();
    });
    setFrequencies(filteredFrequencies);
  };
  const fetchFrequencies = () => {
    if (!selectedDevice) return;
    const db = getDatabase();
    const deviceref = ref(db, `controllers/${selectedDevice}/frequency`);

    get(deviceref)
      .then((snapshot) => {
        const fetchedData = snapshot.val();
        if (fetchedData) {
          const frequencyArray = Object.entries(fetchedData)
            .map(([timestamp, value]) => ({ timestamp, value }));
          const sortedFrequencies = sortFrequencies(frequencyArray, sortOrder);
          setFrequencies(sortedFrequencies);
          setAllFrequencies(sortedFrequencies);
        } else {
          console.error("Fetched data is not available:", fetchedData);
        }
      })
      .catch((error) => {
        console.error("Error fetching data from Firebase:", error);
      });
  };

  useEffect(() => {
    fetchFrequencies();
  }, []);

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

  const handleSearch = () => {
    const filteredFrequencies = allFrequencies.filter(item => {
      return searchFrequency ? item.value.toString() === searchFrequency : true;
    });
    setFrequencies(filteredFrequencies);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
    
    const filteredFrequencies = allFrequencies.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate.toDateString() === currentDate.toDateString();
    });
    setFrequencies(filteredFrequencies);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>All Frequencies</Text>
        <TouchableOpacity onPress={fetchFrequencies} style={styles.refreshButton}>
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
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        themeVariant="light"      />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Frequency"
          placeholderTextColor="#cccccc"
          value={searchFrequency}
          onChangeText={setSearchFrequency}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Feather name="search" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {frequencies.length > 0 ? (
          frequencies.map((item, index) => (
            <View key={index} style={styles.frequencyItem}>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
              <Text style={styles.value}>{item.value} Hz</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No frequency data available</Text>
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
    backgroundColor: 'rgba(40, 68, 104, 0.4)',
    padding: 0
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "rgba(40, 68, 104, 0.4)",
    color: "#ffffff",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: 'rgba(40, 68, 104, 0.4)',
    padding: 10,
    borderRadius: 8,
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
});

export default AllFrequencies;
