import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../context/firebaseConfig';

const Forgotpassword = () => {
  //state variable
  const [email, setEmail] = useState('');


  //handles reseting password
  const handlePasswordReset = () => {
    if (email) {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          Alert.alert(
            'Success',
            'Password reset email has been sent!',
            [{ text: 'OK' }]
          );
        })
        .catch((error) => {
          console.error('Error sending password reset email:', error);
          Alert.alert('Error', error.message, [{ text: 'OK' }]);
        });
    } else {
      Alert.alert('Error', 'Please enter a valid email address');
    }
  };

  return (

    //dispalys forgot password btn
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password?</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#aaa"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Pressable style={styles.button} onPress={handlePasswordReset}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </Pressable>
    </View>
  );
};
//styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#1b252d',
  },
  title: {
    color: "white",
    fontSize: 25,
    paddingBottom: 20
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#506680',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#2a3b4d',
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default Forgotpassword;
