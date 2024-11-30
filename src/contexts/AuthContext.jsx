import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, useContext, useState, useEffect } from 'react';

import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      console.log('Auth state changed. User:', user?.uid);

      if (user) {
        try {
          // Check if user is a club
          console.log('Checking if user is a club...');
          const clubDoc = await getDoc(doc(db, 'clubs', user.uid));

          if (clubDoc.exists()) {
            console.log('User is a club');
            const clubData = clubDoc.data();
            setUser({
              ...user,
              clubData: clubData,
              isClub: true,
            });
          } else {
            // Check if user is a fan
            console.log('Checking if user is a fan...');
            const fanDoc = await getDoc(doc(db, 'fans', user.uid));

            if (fanDoc.exists()) {
              console.log('User is a fan');
              const fanData = fanDoc.data();
              console.log('Fan data:', fanData);
              setUser({
                ...user,
                fanData: fanData,
                isClub: false,
                followedClubs: fanData.followedClubs || [],
              });
            } else {
              console.log('User is neither a club nor a fan');
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
        }
      } else {
        console.log('No user signed in');
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Debug current state
  useEffect(() => {
    console.log('Current auth state:', {
      user: user?.uid,
      isClub: user?.isClub,
      followedClubs: user?.fanData?.followedClubs,
      loading,
    });
  }, [user, loading]);

  const value = {
    user,
    loading,
    isClub: user?.isClub || false,
    followedClubs: user?.fanData?.followedClubs || [],
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthProvider;
