import React, { useEffect, useState } from "react";
import { useUser } from "../context/userContext";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { sendPasswordResetEmail, getAuth, updateProfile } from "firebase/auth";
import { Feather } from '@expo/vector-icons';

const EditProfile = () => {

  //displaying state variables
  const { user, loading, setUser } = useUser();
  const [retrievedData, setRetrievedData] = useState({
    name: '',
    email: '',
    zip: '',
  });
  const [name, setName] = useState('');
  const [zip, setZip] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

 
  useEffect(() => {
    if (!user || !user.uid) return;

    const db = getDatabase();
    const deviceRef = ref(db, 'users/' + user.uid);
    // checks the database for changes within the users profile. this will run on first render of the componenet allowing to access the users information
    onValue(deviceRef, (snapshot) => {
      const data = snapshot.val();
      setRetrievedData({
        name: user.displayName,
        zip: data?.zip || '',
      });
      setName(user.displayName || '');
      setZip(data?.zip || '');
    });
    //fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [user, fadeAnim]);
  //handles the resetting of password for the user
  const handlePasswordReset = () => {
    const auth = getAuth();
    if (user && user.email) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => {
          Alert.alert('Success', 'Password reset email has been sent!', [{ text: 'OK' }]);
        })
        .catch((error) => {
          console.error('Error sending password reset email:', error);
          Alert.alert('Error', error.message, [{ text: 'OK' }]);
        });
    } else {
      Alert.alert('Error', 'Email address not found');
    }
  };
  //handles saving the user information to the RTDB
  const handleSave = async () => {
    if (!user || !user.uid) return;

    const db = getDatabase();
    const deviceRef = ref(db, 'users/' + user.uid);

    try {
      update(deviceRef, {
        username: name,
        zip: zip,
      });

      const auth = getAuth();
      await updateProfile(auth.currentUser, {
        displayName: name
      });
      setUser({ ...user, displayName: name });
    } catch (error) {
      console.log(error);
    }
  };

  //if no user infromation is found we will display this 
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
      </View>
    );
  }


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* displays user infromation  */}
          <View style={styles.userInfoContainer}>
            <Feather name="user" size={24} color="#ffffff" style={styles.icon} />
            <Text style={styles.userInfoText}>{user.displayName || "No Name Available"}</Text>
            {retrievedData.zip && (
              <View style={styles.zipContainer}>
                <Feather name="map-pin" size={18} color="#ffffff" style={styles.zipIcon} />
                <Text style={styles.zipText}>{retrievedData.zip}</Text>
              </View>
            )}
          </View>


            {/* text inputs for the user */}
          <View style={styles.inputContainer}>
            <Feather name="edit-2" size={20} color="#6E7F87" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(text) => setName(text)}
              placeholder="Name"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="map-pin" size={20} color="#6E7F87" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={zip}
              onChangeText={(text) => setZip(text)}
              placeholder="Zip"
              keyboardType="numeric"
              placeholderTextColor="#aaa"
            />
          </View>
            {/* save changes and reset password btn */}
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Feather name="save" size={20} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handlePasswordReset}>
            <Feather name="lock" size={20} color="#ffffff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
//styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b252d',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userInfoContainer: {
    backgroundColor: '#2a3b4d',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
    borderColor: '#506680',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfoText: {
    color: '#ffffff',
    fontSize: 20,
    marginTop: 10,
    fontWeight: '600',
  },
  zipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  zipText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#2a3b4d',
    borderRadius: 10,
    borderColor: '#506680',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginLeft: 15,
  },
  button: {
    backgroundColor: 'rgba(40, 68, 104, 0.4)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resetButton: {
    backgroundColor: '#3d4e5f',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  icon: {
    marginBottom: 10,
  },
  zipIcon: {
    marginRight: 5,
  },
});

export default EditProfile;
