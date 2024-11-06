import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

const SetupOptions = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Choose Setup Option</Text>
                    <Text style={styles.subtitle}>Select how you'd like to set up your device</Text>
                </View>

                <View style={styles.optionsContainer}>
                    <TouchableOpacity 
                        style={styles.optionButton} 
                        onPress={() => navigation.navigate("BLEdemo")}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="bluetooth" size={24} color="#ffffff" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.buttonTitle}>New ESP32 Setup</Text>
                            <Text style={styles.buttonSubtitle}>Set up a new ESP32 for the first time</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#ffffff" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.optionButton} 
                        onPress={() => navigation.navigate('AddDevice')}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.buttonTitle}>Add Existing Device</Text>
                            <Text style={styles.buttonSubtitle}>ESP32 already connected, add to your account</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1b252d",
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#ffffff',
        opacity: 0.8,
    },
    optionsContainer: {
        marginTop: 20,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    iconContainer: {
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderRadius: 12,
        padding: 10,
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    buttonTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 5,
    },
    buttonSubtitle: {
        fontSize: 14,
        color: '#ffffff',
        opacity: 0.8,
    },
});

export default SetupOptions;