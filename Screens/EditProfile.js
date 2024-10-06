import React, { useEffect, useState } from "react";
import { useUser } from "../context/userContext";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { sendPasswordResetEmail ,getAuth, updateProfile } from "firebase/auth";

const EditProfile = () => {
    const { user, loading, setUser } = useUser();
    const [retrievedData, setRetrievedData] = useState({
        name: '',
        email: '',
        zip: '',
    });

    const handlePasswordReset = () => {
        if (email) {
          sendPasswordResetEmail(auth, email)
            .then(() => {
              // Email sent successfully
              Alert.alert(
                'Success',
                'Password reset email has been sent!',
                [{ text: 'OK' }]
              );
            })
            .catch((error) => {
              // Handle errors (e.g., invalid email, user not found)
              console.error('Error sending password reset email:', error);
              Alert.alert('Error', error.message, [{ text: 'OK' }]);
            });
        } else {
          Alert.alert('Error', 'Please enter a valid email address');
        }
      };


    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [zip, setZip] = useState();

    useEffect(() => {
            const db = getDatabase();
            const deviceRef = ref(db, 'users/' + user.uid);
            onValue(deviceRef, (snapshot) => {
                const data = snapshot.val();
                setRetrievedData({
                    name: user.displayName,
                    zip: data.zip
                });
                console.log(data);
            });
    }, [user]);

    const handleSave = async () => {
        const db = getDatabase();
        const deviceRef = ref(db, 'users/' + user.uid);

        try{
        console.log("check the new data")
        console.log(retrievedData)
        update(deviceRef, {
            username: name,
            zip: zip,
        });
        setRetrievedData({username: name, email:email, zip:zip})

        const auth = getAuth();
        updateProfile(auth.currentUser, {
        displayName: name
        }).then(() => {
            setUser({...user, displayName: name});
        }).catch((error) => {
            console.log(error)
        });
        console.log("Data saved:", user.displayName);
    }
    catch(error){
        console.log(error)
    }
    };

    return (
        <View style={styles.background}>

            <TextInput
                style={styles.input}
                value={name}
                onChangeText={(text) => setName(text)}
                placeholder="Name"
            />
            <TextInput
                style={styles.input}
                value={zip}
                onChangeText={(text) => setZip(text)}
                placeholder="Zip"
                keyboardType="numeric"
            />

            <Button title="Save Changes" onPress={handleSave} />
            <Button title="Press to reset password" onPress={handlePasswordReset} />


            {user && <Text style={styles.userInfoText}>Welcome, {user.displayName}</Text>}
            {retrievedData.zip && <Text style={styles.userInfoText}>Zip: {retrievedData.zip}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        width: '100%',
        marginBottom: 15,
    },
    buttonText: {
        color: 'black',
        fontSize: 18,
        marginBottom: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    userInfoText: {
        color: 'black',
        fontSize: 16,
    },
});

export default EditProfile;
