
import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { useUser } from "../context/userContext";


const Homescreen = () => {
    const { user } = useUser(); 
    return (
      <View style={styles.container}>
        <View style={styles.greetingContainer}>
            <Text style={styles.greeting1}>Good afternoon,</Text>
            <Text style={styles.greeting2}>{user?.displayName != null ? user.displayName : "User"}</Text>
        </View>

        <View style={styles.devicesContainer}>
        {/* make call to database to check to see if they have any devices available to there UID */}
        {/* for now will be always assumed no devices. */}
            <Text style={styles.noDeviceText}>No devices connected</Text>
            <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Add Device</Text>
            </Pressable>
        </View>
      </View>
    );
  }


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1b252d"
    },
    greetingContainer: {
        marginTop: 50,
        marginLeft: 20
    },
    greeting1: {
        color: "white",
        fontSize: 13
    },
    greeting2: {
        color: "white",
        fontSize: 23
    },
    devicesContainer:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: "white",
        borderRadius: 10,
        marginTop: 15
    },
    buttonText: {
        color: "#1b252d",
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 20,
        marginRight: 20,
        
    },
    noDeviceText: {
        color:"white"
    }
});

export default Homescreen;