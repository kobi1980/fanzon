// src/scripts/initializeData.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCmpgQsZxaCIc0eHSLmTSjIn0Vy233Lmhw',
  authDomain: 'fanzon-688cf.firebaseapp.com',
  projectId: 'fanzon-688cf',
  storageBucket: 'fanzon-688cf.firebasestorage.app',
  messagingSenderId: '309701664220',
  appId: '1:309701664220:web:3e07a6a3b5c89d022fc319',
  measurementId: 'G-F9H21SMWK5',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const initializeTestMatches = async () => {
  const matches = [
    {
      homeTeam: 'Liverpool',
      awayTeam: 'Manchester United',
      startTime: new Date(Date.now() + 86400000), // tomorrow
      totalGrant: 0,
      grants: {},
    },
    {
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      startTime: new Date(Date.now() + 172800000), // day after tomorrow
      totalGrant: 0,
      grants: {},
    },
    {
      homeTeam: 'Manchester City',
      awayTeam: 'Tottenham',
      startTime: new Date(Date.now() + 259200000), // 3 days from now
      totalGrant: 0,
      grants: {},
    },
  ];

  try {
    for (const match of matches) {
      await addDoc(collection(db, 'matches'), match);
    }
    console.log('Test matches added successfully!');
  } catch (error) {
    console.error('Error adding test matches:', error);
  }
};

initializeTestMatches();
