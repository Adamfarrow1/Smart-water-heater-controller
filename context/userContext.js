import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebase from '../context/firebaseConfig';

const UserContext = createContext();

export const AuthenticationContext = ({ children }) => {
   // define our auth variable with getAuth from firebase
    const auth = getAuth(firebase);

     // delcare our user useState
    const [user, setUser] = useState(null);
    

    useEffect(() => {
    //on auth state changeed makes it so that this function will be called whenever a user signs in or out
    // firebase does alot of heavy lifting here 
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });


    // unsub is used as return to "clean up" the use effect
    //known to be good practice
    return () => unsub();


  }, [auth]);


  // we must return our context within this form.
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
