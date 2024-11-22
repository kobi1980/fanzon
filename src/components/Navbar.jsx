import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const { user, isClub } = useAuth();
  const navigate = useNavigate();
  const [clubUrls, setClubUrls] = useState({});

  useEffect(() => {
    const fetchClubUrls = async () => {
      if (user?.fanData?.followedClubs) {
        const urls = {};
        for (const clubId of user.fanData.followedClubs) {
          const clubDoc = await getDoc(doc(db, 'clubs', clubId));
          if (clubDoc.exists() && 
              (clubDoc.data().fanShopUrl || clubDoc.data().seasonTicketsUrl)) {
            urls[clubId] = { ...clubDoc.data(), clubId };
          }
        }
        setClubUrls(urls);
      }
    };

    fetchClubUrls();
  }, [user]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link 
              to={user ? (isClub ? "/club/dashboard" : "/matches") : "/login"} 
              className="text-xl font-bold text-blue-600"
            >
              Fanzon
            </Link>
            {/* Club Links */}
            {Object.values(clubUrls).map((club) => (
              <div key={club.clubId} className="flex items-center space-x-2">
                {club.fanShopUrl && (
                  <a 
                    href={club.fanShopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Shop
                  </a>
                )}
                {club.seasonTicketsUrl && (
                  <a 
                    href={club.seasonTicketsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                    </svg>
                    Tickets
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {isClub ? (
                  <>
                    <Link 
                      to="/club/players"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2"
                    >
                      Players
                    </Link>
                    <Link 
                      to="/club/config"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2"
                    >
                      Club Settings
                    </Link>
                  </>
                ) : (
                  <Link 
                    to="/profile"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2"
                  >
                    Settings
                  </Link>
                )}
                <span className="text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;