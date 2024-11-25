import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebase from '../context/firebaseConfig';

const UserContext = createContext();
//user context file
//used for accessing user infromation across multiple components
export const AuthenticationContext = ({ children }) => {

  //declare user context state variables
    const auth = getAuth(firebase);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(null);
    

    useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false)
    });
    return () => unsub();
  }, [auth]);

  //export context variables used in other files
  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
