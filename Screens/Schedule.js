import React, { useState, useLayoutEffect, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, Modal, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Agenda } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { getDatabase, ref, onValue, update, push, set, off, remove } from "firebase/database";
import { useDevice } from '../context/DeviceContext';

const currentDate = new Date().toISOString().split('T')[0];

function Schedule() {

  //declare usestate 
  const navigation = useNavigation();
  const { selectedDevice } = useDevice(); 
  const [selectedDay, setSelectedDay] = useState(currentDate);
  const [items, setItems] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("");

  // displays the add button in the top right corner
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.navButton}>
          <Text style={styles.navButtonText}>Add</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // grabs the scheduling information from the database
  useEffect(() => {
    if (!selectedDevice) return;
    const db = getDatabase();
    const deviceRef = ref(db, `controllers/${selectedDevice}/scheduling`);
  
    onValue(deviceRef, (snapshot) => {
      const data = snapshot.val() ?? {};
      const newItems = {};
  
      Object.entries(data).forEach(([date, events]) => {
        if (date === selectedDay) {
          newItems[date] = [];
  
          Object.entries(events).forEach(([eventId, event]) => {
            newItems[date].push({
              id: eventId,
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


  // addes a new even to the database in the scheduling array
  const addNewEvent = () => {
    if (!selectedDevice) return;
    if (newEventName.trim()) {
      const db = getDatabase();
      const deviceRef = ref(db, `controllers/${selectedDevice}/scheduling/${selectedDay}`);
  
      const newEventRef = push(deviceRef);
      const newEventData = {
        name: newEventName,
        from: fromTime.toLocaleTimeString(),
        to: toTime.toLocaleTimeString(),
        timestamp: Date.now(),
      };
  
      set(newEventRef, newEventData)
        .then(() => {
          setIsModalVisible(false);
          setNewEventName('');
        })
        .catch((firebaseError) => {
          console.error("Error adding event to Firebase:", firebaseError);
        });
    }
  };


  //deletes the selected scheduled time from the database
  const deleteSchedule = () => {
    if (!selectedDevice || !selectedEventId) return;
    const db = getDatabase();
    const eventRef = ref(db, `controllers/${selectedDevice}/scheduling/${selectedDay}/${selectedEventId}`);
  
    remove(eventRef)
      .then(() => {
        setIsDeleteModalVisible(false);
  
        const newItems = { ...items };
        if (newItems[selectedDay]) {
          newItems[selectedDay] = newItems[selectedDay].filter(event => event.id !== selectedEventId);
          if (newItems[selectedDay].length === 0) {
            delete newItems[selectedDay];
          }
        }
        setItems(newItems);
      })
      .catch((firebaseError) => {
        console.error("Error deleting event from Firebase:", firebaseError);
      });
  };
  
// when the item is pressed we will set the selected item variables and open the delete modal
  const handleItemPress = (item) => {
    setSelectedEventId(item.id);
    setSelectedEvent(item.name)
    setIsDeleteModalVisible(true);
  };
  // how each item is rendered
  const renderItem = (item) => (
    <TouchableOpacity style={styles.item} onPress={() => handleItemPress(item)}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>
        {typeof item.from === 'string' ? item.from : ''} - {typeof item.to === 'string' ? item.to : ''}
      </Text>
    </TouchableOpacity>
  );
  
//whenever the dataset is empty it displays this
  const renderEmptyData = () => (
    <View style={styles.emptyItem}>
      <Text style={styles.emptyItemText}>No scheduled tasks found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      { items ? 
      //if there are items we will display the agenda
      <Agenda
        items={items}
        onDayPress={(day) => setSelectedDay(day.dateString)}
        renderItem={renderItem}
        renderEmptyData={renderEmptyData}
        theme={{
          backgroundColor: "#1b252d",
          calendarBackground: '#1b252d',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#ffffff',
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
      {/* add event modal */}
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
              {/* delete modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete "{selectedEvent}"</Text>
            <Text style={styles.modalText}>Are you sure you want to delete this event?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={deleteSchedule}>
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsDeleteModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
//delete 
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
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
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
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(40, 68, 104, 1)',
  },
  cancelButton: {
    backgroundColor: 'rgba(40, 68, 104, 0.4)',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Schedule;