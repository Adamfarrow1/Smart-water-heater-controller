import * as React from 'react';
import { View, Button, Text, Animated, StyleSheet, Pressable, ActivityIndicator} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
// this file is not used currently can be deleted in production

function Settings() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        onPress={() => navigation.navigate('Notifications')}
        title="Hi im settings"
      />
    </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1b252d"
    },

});

  export default Settings;