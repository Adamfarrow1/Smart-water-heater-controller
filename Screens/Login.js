import { StyleSheet, Text, View, TextInput, Pressable, TouchableOpacity } from 'react-native';
import {auth,  signInWithEmailAndPassword } from '../context/firebaseConfig';
import { useState } from 'react';
import { useUser } from '../context/userContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { getDatabase, ref, set, get, child } from 'firebase/database';


GoogleSignin.configure({
  webClientId: '200839480102-hddu4k4btp65or4fkfmmfki0snteu69m.apps.googleusercontent.com',
  offlineAccess: true,
});

export default function Login( { navigation }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, setUser } = useUser(); 
  const [error, setError] = useState('');

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const googleCredential = GoogleAuthProvider.credential(userInfo.data.idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;
  
      const db = getDatabase();
      const userRef = ref(db, 'users/' + user.uid);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUser({
          uid: user.uid, 
          displayName: userData.displayName,
          email: userData.email,
          zip: userData.zip
        });
      } else {
        await set(userRef, {
          uid: user.uid,
          displayName: user.displayName || 'Unknown User',
          email: user.email,
          zip: "32837"
        });
  
        setUser({
          uid: user.uid,
          displayName: user.displayName || 'Unknown User',
          email: user.email,
          zip: "32837"
        });
      }
      navigation.navigate("Home");
    } catch (error) {
      console.error('Error during Google sign-in', error);
    }
  };
  
  

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      navigation.navigate("Home")
      
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError('Login failed. Check credentials and try again.');
      }
    }
    
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.formContainer}>
        <Text style={styles.subtitle}>Enter your email and password</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder='Email' placeholderTextColor="#aaa" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder='Password' secureTextEntry={true} placeholderTextColor="#aaa" />
        <TouchableOpacity style={styles.button}  onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        
        <View style={styles.horizontal_line_container}>
          <View style={styles.line} />
            <Text style={styles.breaker_text}>or login with</Text>
          <View style={styles.line} />
        </View>
        <TouchableOpacity style={styles.googleButton } onPress={signInWithGoogle} >
        
          <Text style={styles.googleButtonText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonForgot}  onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.buttonText}>Forgot Password? </Text>
        </TouchableOpacity>
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
  errorText:{
    color: 'red',
    padding: 10
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
  buttonForgot: {
    width: '100%',
    padding: 5,

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
