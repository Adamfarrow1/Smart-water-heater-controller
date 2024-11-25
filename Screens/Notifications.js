import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
//mock notifications
const mockNotifications = [
  { id: '1', title: 'Restarting Water Heater', message: 'Your water heater has been automatically restarted to preserve the integrity of the grid.', time: '2 hours ago'},
  { id: '2', title: 'Water Heater controller connection lost', message: 'Your water heater has lost connection to the network.', time: '1 day ago'},
  { id: '3', title: 'Tip', message: 'Dont forget to schedule regular maintaince to maintain the longevity of your heater.', time: '3 days ago'},
  { id: '4', title: 'Restarting Water Heater', message: 'Your water heater has been automatically restarted to preserve the integrity of the grid.', time: '1 week ago'},
];

const Notifications = () => {
  // declaring state variables
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // remove this useEffect in production 
  //only used to simulate loading times
  useEffect(() => {

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);
  //each individual notification item is rendered as follows
  const renderNotification = ({ item }) => (
    <TouchableOpacity style={[styles.notificationItem, item.read ? styles.readNotification : styles.unreadNotification]}>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );
  // if the list is empty display that there are no notifications
  const renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      <Feather name="bell-off" size={50} color="#bdc3c7" />
      <Text style={styles.emptyListText}>No notifications</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* if we are loading display loading icon  */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        // if we are not loading display the notifications 
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </SafeAreaView>
  );
};
//styles
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingsButton: {
    padding: 10,
  },
  listContainer: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  readNotification: {
    backgroundColor: '#2c3e50',
  },
  unreadNotification: {
    backgroundColor: '#2c3e50',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  notificationTime: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#ecf0f1',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3498db',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyListText: {
    marginTop: 20,
    fontSize: 18,
    color: '#bdc3c7',
  },
});

export default Notifications;