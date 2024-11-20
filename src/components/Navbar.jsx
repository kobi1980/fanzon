import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';

const Navbar = () => {
  const { user, isClub } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Force navigation to login page after signout
      window.location.href = '/login';  // This will ensure a complete refresh
      // Alternatively, you can use:
      // navigate('/login', { replace: true });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to={user ? (isClub ? "/club/dashboard" : "/matches") : "/login"} 
              className="text-xl font-bold text-blue-600"
            >
              Fanzon
            </Link>
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