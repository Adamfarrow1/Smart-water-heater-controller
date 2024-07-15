import { StyleSheet, Text, View, Button, TextInput, Pressable } from 'react-native';
import React, { useState } from 'react';
import {auth,  createUserWithEmailAndPassword } from '../context/firebaseConfig';
import { useUser } from '../context/userContext';
export default function Register() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');
  const [zip, setZip] = useState('');
  const { user } = useUser();

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if(user)
        console.log(user)
      console.log("it works")
    } catch (error) {
      console.log("it doe snot work")
      console.log(error);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <View style={styles.formContainer}>
        <Text style={styles.subtitle}>Enter your email and password</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder='Email' placeholderTextColor="#aaa" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder='Password' secureTextEntry={true} placeholderTextColor="#aaa" />
        <TextInput style={styles.input} value={repassword} onChangeText={setRepassword} placeholder='Re-enter Password' secureTextEntry={true} placeholderTextColor="#aaa" />
        <TextInput style={styles.input} value={zip} onChangeText={setZip} placeholder='Zip code' secureTextEntry={true} placeholderTextColor="#aaa" />
        <Pressable style={styles.button}  onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </Pressable>
        {/* <View style={styles.horizontal_line_container}>
          <View style={styles.line} />
            <Text style={styles.breaker_text}>or login with</Text>
          <View style={styles.line} />
        </View>
        <TouchableOpacity style={styles.googleButton}>
        
          <Text style={styles.googleButtonText}>Google</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b252d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  breaker_text:{
    marginHorizontal: 10,
    color: '#bbbbbb',
    fontSize: 16,
    paddingHorizontal: 10,
  },
  horizontal_line_container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#bbbbbb',
    margin: 2
  },
  title: {
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#bbbbbb',
    marginBottom: 20,
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
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#506680',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  googleButton: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#db4437',
    alignItems: 'center',
    marginTop: 10,
  },
  googleButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});
