import React, { createContext, useContext, useState } from 'react';


const DeviceContext = createContext();


export const DeviceProvider = ({ children }) => {
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
