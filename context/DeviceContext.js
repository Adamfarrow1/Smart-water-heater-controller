import React, { createContext, useContext, useState } from 'react';

// Create the DeviceContext
const DeviceContext = createContext();

// Create a provider component
export const DeviceProvider = ({ children }) => {
    const [selectedDevice, setSelectedDevice] = useState(null); // Initialize to null or a default value
    const [deviceInfo, setDeviceInfo] = useState({}); // Initialize deviceInfo to an empty object

    return (
        <DeviceContext.Provider value={{ selectedDevice, setSelectedDevice, deviceInfo, setDeviceInfo }}>
            {children}
        </DeviceContext.Provider>
    );
};

// Create a custom hook to use the DeviceContext
export const useDevice = () => {
    return useContext(DeviceContext);
};
