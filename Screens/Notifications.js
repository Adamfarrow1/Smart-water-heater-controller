import * as React from 'react';
import { View, Button, Text, Animated, StyleSheet, Pressable, ActivityIndicator} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


function Notifications() {
    return (
      <View style={styles.container}>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1b252d"
    },

});

  export default Notifications;