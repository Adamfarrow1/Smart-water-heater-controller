import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Agenda } from 'react-native-calendars';

const currentDate = new Date().toISOString().split('T')[0];
const work = { key: 'work', color: 'red', selectedDotColor: 'blue' };
const massage = { key: 'massage', color: 'white', selectedDotColor: 'white' };
const workout = { key: 'workout', color: 'green' };

function Schedule() {
  const [selectedDay, setSelectedDay] = useState(currentDate);
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const [items, setItems] = useState({
    '2024-08-24': [{ name: 'Sample task for 24th' }],
    '2024-08-26': [{ name: 'Sample task for 26th' }],
  });

  const onDayPress = (day) => {
    setSelectedDay(day.dateString);
    setIsCalendarOpen(false); // Close the calendar when a day is pressed
  };

  const renderItem = (item) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
    </View>
  );

  // This function will be called when no items exist for a selected day
  const renderEmptyData = () => (
    <View style={styles.emptyItem}>
      <Text style={styles.emptyItemText}>No scheduled tasks found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Agenda
        items={items}
        loadItemsForMonth={(month) => {
          console.log('trigger items loading');
        }}
        onDayPress={onDayPress}
        selected={selectedDay}
        hideKnob={false}
        showClosingKnob={true}
        markedDates={{
          [selectedDay]: { selected: true, marked: true, dots: [work, massage, workout] },
        }}
        renderItem={renderItem}
        renderEmptyData={renderEmptyData}  // Renders when no data is available
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
          textDayHeaderFontSize: 16
        }}
        style={{}}
      />
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
});

export default Schedule;
