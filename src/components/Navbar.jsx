import { doc, getDoc } from 'firebase/firestore';
import {
  Menu,
  X,
  ShoppingCart,
  Ticket,
  Users,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Home,
  Goal,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';

const Navbar = () => {
  const { user, isClub } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [clubUrls, setClubUrls] = useState({});

  useEffect(() => {
    const fetchClubUrls = async () => {
      if (user?.fanData?.followedClubs) {
        const urls = {};
        for (const clubId of user.fanData.followedClubs) {
          const clubDoc = await getDoc(doc(db, 'clubs', clubId));
          if (clubDoc.exists() && (clubDoc.data().fanShopUrl || clubDoc.data().seasonTicketsUrl)) {
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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Row - Logo and Email */}
        <div className="flex justify-between items-center h-12 border-b">
          <Link
            to={user ? (isClub ? '/club/dashboard' : '/matches') : '/login'}
            className="flex items-center space-x-2 text-blue-600"
          >
            <Home className="h-5 w-5" />
            <span className="font-bold">Fanzon</span>
          </Link>
          {user && <span className="text-gray-600 text-sm">{user.email}</span>}
        </div>

        {/* Bottom Row - Navigation Items */}
        <div className="flex justify-between h-14">
          {/* Club URLs - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {Object.values(clubUrls).map(club => (
              <div key={club.clubId} className="flex items-center space-x-2">
                {club.fanShopUrl && (
                  <a
                    href={club.fanShopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="ml-1 hidden lg:inline">Shop</span>
                  </a>
                )}
                {club.seasonTicketsUrl && (
                  <a
                    href={club.seasonTicketsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    <Ticket className="h-4 w-4" />
                    <span className="ml-1 hidden lg:inline">Tickets</span>
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {isClub ? (
                  <>
                    <Link
                      to="/club/matches"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 flex items-center"
                    >
                      <Goal className="h-5 w-5" />
                      <span className="ml-1 hidden lg:inline">Matches</span>
                    </Link>
                    <Link
                      to="/club/players"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 flex items-center"
                    >
                      <Users className="h-5 w-5" />
                      <span className="ml-1 hidden lg:inline">Players</span>
                    </Link>
                    <Link
                      to="/club/config"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 flex items-center"
                    >
                      <Settings className="h-5 w-5" />
                      <span className="ml-1 hidden lg:inline">Settings</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 flex items-center"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="ml-1 hidden lg:inline">Settings</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-1 hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 flex items-center"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="ml-1 hidden lg:inline">Login</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center"
                >
                  <UserPlus className="h-5 w-5" />
                  <span className="ml-1 hidden lg:inline">Register</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} border-t`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {Object.values(clubUrls).map(club => (
              <div key={club.clubId} className="flex flex-col space-y-1">
                {club.fanShopUrl && (
                  <a
                    href={club.fanShopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 bg-blue-500 text-white rounded"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="ml-2">Shop</span>
                  </a>
                )}
                {club.seasonTicketsUrl && (
                  <a
                    href={club.seasonTicketsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 bg-green-500 text-white rounded"
                  >
                    <Ticket className="h-5 w-5" />
                    <span className="ml-2">Tickets</span>
                  </a>
                )}
              </div>
            ))}
            {user ? (
              <>
                {isClub ? (
                  <>
                    <Link
                      to="/matches"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <Goal className="h-5 w-5" />
                      <span className="ml-2">Matches</span>
                    </Link>
                    <Link
                      to="/club/players"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <Users className="h-5 w-5" />
                      <span className="ml-2">Players</span>
                    </Link>
                    <Link
                      to="/club/config"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <Settings className="h-5 w-5" />
                      <span className="ml-2">Settings</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="ml-2">Settings</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 bg-red-500 text-white rounded"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-2">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="ml-2">Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center px-3 py-2 bg-blue-500 text-white rounded"
                >
                  <UserPlus className="h-5 w-5" />
                  <span className="ml-2">Register</span>
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
