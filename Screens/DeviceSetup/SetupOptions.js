import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Button, Modal, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SetupOptions = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choose Setup Option</Text>
            <TouchableOpacity 
                style={styles.button} 
                onPress={() => navigation.navigate("BLEdemo")}
            >
                <Text style={styles.buttonText}>Setup new ESP32 for the first time</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button} 
                onPress={() => navigation.navigate('AddDevice')}
            >
                <Text style={styles.buttonText}>ESP32 already connected, add device to my account</Text>
            </TouchableOpacity>
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: "#1b252d",
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40,
        color: 'white',
    },
    optionsContainer:
    {
        alignItems: 'center',
    marginVertical: 20,
    backgroundColor: 'rgb(240, 240, 240)', // Semi-transparent blue
    padding: 15,
    borderRadius: 10,

    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 5,
        marginVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});


export default SetupOptions;