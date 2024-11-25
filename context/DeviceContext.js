import React, { createContext, useContext, useState } from 'react';


const DeviceContext = createContext();

// declaration of the device context
export const DeviceProvider = ({ children }) => {

    //allows for user update device information within whatever the user wraps the context in
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [deviceInfo, setDeviceInfo] = useState({});
    const [name, setName] = useState('');

    return (
        <DeviceContext.Provider value={{ selectedDevice, setSelectedDevice, deviceInfo, setDeviceInfo, setName, name }}>
            {children}
        </DeviceContext.Provider>
    );
};


export const useDevice = () => {
    return useContext(DeviceContext);
};
