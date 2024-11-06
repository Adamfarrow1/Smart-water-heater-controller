import React, { useState, useLayoutEffect, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, Modal, TextInput, Button, TouchableOpacity } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Agenda } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { getDatabase, ref, onValue, update, push, set, off } from "firebase/database";
import { useDevice } from '../context/DeviceContext';

const currentDate = new Date().toISOString().split('T')[0];
const work = { key: 'work', color: 'red', selectedDotColor: 'blue' };
const massage = { key: 'massage', color: 'white', selectedDotColor: 'white' };
const workout = { key: 'workout', color: 'green' };

function Schedule() {
  const navigation = useNavigation();
  const { selectedDevice } = useDevice(); 
  const [selectedDay, setSelectedDay] = useState(currentDate);
  const [items, setItems] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.navButton}>
          <Text style={styles.navButtonText}>Add</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (!selectedDevice) return;
    const db = getDatabase();
    const deviceRef = ref(db, `controllers/${selectedDevice}/scheduling`);
  
    onValue(deviceRef, (snapshot) => {
      const data = snapshot.val() ?? {};
      const newItems = {};
  
      // Iterate over each date in the data
      Object.entries(data).forEach(([date, events]) => {
        if (date >= selectedDay) { // Only include dates that are the selected day or in the future
          newItems[date] = [];
  
          // Iterate over each event under the specific date
          Object.entries(events).forEach(([eventId, event]) => {
            newItems[date].push({
              name: event.name,
              from: event.from,
              to: event.to,
            });
          });
        }
      });
  
      setItems(newItems);
    }, (firebaseError) => {
      console.error("Error reading scheduling data from Firebase:", firebaseError);
    });
  
    return () => {
      off(deviceRef);
    };
  }, [selectedDevice, selectedDay]);
  
  

  const onDayPress = (day) => {
    setSelectedDay(day.dateString);
  };

  const addNewEvent = () => {
    if (!selectedDevice) return;
    if (newEventName.trim()) {
      // Update local state for displaying in the agenda
      setItems((prevItems) => ({
        ...prevItems,
        [selectedDay]: [
          ...(prevItems[selectedDay] || []),
          { name: newEventName, from: fromTime.toLocaleTimeString(), to: toTime.toLocaleTimeString() },
        ],
      }));
  
      // Save the new event to Firebase under the specific selected date
      const db = getDatabase();
      const deviceRef = ref(db, `controllers/${selectedDevice}/scheduling/${selectedDay}`);
  
      // Use `push` to add a new unique key for each event under the selected date in Firebase
      const newEventRef = push(deviceRef);
      const newEventData = {
        name: newEventName,
        from: fromTime.toLocaleTimeString(),
        to: toTime.toLocaleTimeString(),
        timestamp: Date.now(),
      };
  
      set(newEventRef, newEventData)
        .then(() => {
          console.log("Event successfully added to Firebase");
        })
        .catch((firebaseError) => {
          console.error("Error adding event to Firebase:", firebaseError);
        });
    }
  };
  

  const renderItem = (item) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>
        {typeof item.from === 'string' ? item.from : ''} - {typeof item.to === 'string' ? item.to : ''}
      </Text>
    </View>
  );
  

  const renderEmptyData = () => (
    <View style={styles.emptyItem}>
      <Text style={styles.emptyItemText}>No scheduled tasks found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      { items ? 
      <Agenda
        items={items}
        onDayPress={onDayPress}
        selected={selectedDay}
        markedDates={{
          [selectedDay]: { selected: true, marked: true, dots: [work, massage, workout] },
        }}
        renderItem={renderItem}
        renderEmptyData={renderEmptyData}
        theme={{
          backgroundColor: "#1b252d",
          calendarBackground: '#1b252d',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#2d4150',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          arrowColor: 'orange',
          monthTextColor: '#FFFFFF',
          textDayFontFamily: 'monospace',
          textMonthFontFamily: 'monospace',
          textDayHeaderFontFamily: 'monospace',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
        }}
        style={{}}
      /> : null
      }
      {/* Modal for adding new event */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Event</Text>
            <TextInput
              style={styles.input}
              placeholder="Event name"
              value={newEventName}
              onChangeText={setNewEventName}
            />

            {/* From Time Picker */}
            <TouchableOpacity onPress={() => setShowFromPicker(true)} style={styles.timeButton}>
              <Text style={styles.timeButtonText}>
                From: {fromTime.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={showFromPicker}
              mode="time"
              themeVariant="light"
              is24Hour={true}
              onConfirm={(selectedTime) => {
                setShowFromPicker(false);
                if (selectedTime) setFromTime(selectedTime);
              }}
              onCancel={() => setShowFromPicker(false)}
            />

            {/* To Time Picker */}
            <TouchableOpacity onPress={() => setShowToPicker(true)} style={styles.timeButton}>
              <Text style={styles.timeButtonText}>
                To: {toTime.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={showToPicker}
              mode="time"
              themeVariant="light"
              is24Hour={true}
              onConfirm={(selectedTime) => {
                setShowToPicker(false);
                if (selectedTime) setToTime(selectedTime);
              }}
              onCancel={() => setShowToPicker(false)}
            />

            <Button title="Add Event" onPress={addNewEvent} />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b252d",
  },
  item: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  itemText: {
    color: '#1b252d',
  },
  emptyItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  emptyItemText: {
    color: '#b6c1cd',
    fontSize: 16,
  },
  navButton: {
    marginRight: 15,
    padding: 5,
  },
  navButtonText: {
    color: '#00adf5',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
  },
  timeButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginVertical: 5,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default Schedule;
