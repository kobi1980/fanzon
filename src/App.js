import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ClubLogin from './components/ClubLogin';
import ClubRegister from './components/ClubRegister';
import ClubDashboard from './components/ClubDashboard';
import UserProfile from './components/UserProfile';
import MatchList from './components/MatchList';
import MatchDetail from './components/MatchDetail';
import Navbar from './components/Navbar';
import ResetPassword from './components/ResetPassword';
import ClubConfig from './components/ClubConfig';
import ClubPlayers from './components/ClubPlayers';

// Protected Route Component
const ProtectedRoute = ({ children, requiresClub = false }) => {
  const { user, isClub } = useAuth();
  
  if (!user) {
    return <Navigate to={requiresClub ? "/club/login" : "/login"} />;
  }

  if (requiresClub && !isClub) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto p-4 mt-8">
            <Routes>
              {/* Fan Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              <Route path="/matches" element={
                <ProtectedRoute>
                  <MatchList />
                </ProtectedRoute>
              } />
              <Route path="/match/:id" element={
                <ProtectedRoute>
                  <MatchDetail />
                </ProtectedRoute>
              } />

              {/* Club Routes */}
              <Route path="/club/login" element={<ClubLogin />} />
              <Route path="/club/register" element={<ClubRegister />} />
              <Route path="/club/reset-password" element={<ResetPassword />} />
              <Route path="/club/dashboard" element={
                <ProtectedRoute requiresClub={true}>
                  <ClubDashboard />
                </ProtectedRoute>
              } />
              <Route 
                path="/club/players" 
                element={
                  <ProtectedRoute requiresClub={true}>
                    <ClubPlayers />
                  </ProtectedRoute>
                }
              />

              {/* Default Routes */}
              <Route path="/" element={<Navigate to="/matches" />} />
              <Route path="/club" element={<Navigate to="/club/login" />} />
              <Route 
                path="/club/config" 
                element={
                  <ProtectedRoute requiresClub={true}>
                    <ClubConfig />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;