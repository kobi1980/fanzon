import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase';

const ClubLogin = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    const checkAndNavigate = async () => {
      if (user) {
        const clubDoc = await getDoc(doc(db, 'clubs', user.uid));
        if (clubDoc.exists()) {
          navigate('/club/dashboard');
        }
      }
    };
    checkAndNavigate();
  }, [user, navigate]);

  const handleEmailLogin = async e => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const clubRef = doc(db, 'clubs', userCredential.user.uid);
      const clubDoc = await getDoc(clubRef);

      if (!clubDoc.exists()) {
        await auth.signOut();
        setError('This account is not registered as a club.');
        return;
      }
      // Navigation will happen through useEffect
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const clubRef = doc(db, 'clubs', result.user.uid);
      const clubDoc = await getDoc(clubRef);

      if (!clubDoc.exists()) {
        await auth.signOut();
        setError('This Google account is not registered as a club.');
        return;
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to login with Google.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center space-x-4 border-b pb-4">
          <Link to="/login" className="text-gray-500 hover:text-gray-700">
            Fan Login
          </Link>
          <span className="text-blue-600 font-semibold">Club Login</span>
        </div>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Club Sign In</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Login to manage your club&apos;s matches
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="mt-8 space-y-6">
          <div className="rounded-md -space-y-px">
            <div>
              <input
                type="email"
                placeholder="Club Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/club/reset-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </Link>
            <Link
              to="/club/register"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Register new club
            </Link>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group relative flex-none w-12 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              G
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClubLogin;
