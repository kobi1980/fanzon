import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { updatePassword, updateEmail } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  console.log('Component mounting');
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [availableClubs, setAvailableClubs] = useState([]);
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Initial formData:', formData);
        const userDoc = await getDoc(doc(db, 'fans', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({           // Changed from setFormData(prev => ({
            name: userData.name || '',
            email: user.email,
            newPassword: '',      // Explicitly empty
            confirmPassword: ''   // Explicitly empty
          });
          setSelectedClubs(userData.followedClubs || []);
        }
  
        const clubsSnapshot = await getDocs(collection(db, 'clubs'));
        const clubsData = clubsSnapshot.docs.map(doc => ({
          id: doc.id,
          clubName: doc.data().clubName
        }));
        setAvailableClubs(clubsData);
      } catch (error) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [user]);

  const handleClubToggle = (clubId) => {
    setSelectedClubs(prev => 
      prev.includes(clubId) 
        ? prev.filter(id => id !== clubId)
        : [...prev, clubId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
  
    try {
      const updates = {
        name: formData.name,
        followedClubs: selectedClubs
      };
  
      // Only handle password update if both fields have values
      if (formData.newPassword.trim() !== '' || formData.confirmPassword.trim() !== '') {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.newPassword.trim().length > 0) {
          await updatePassword(auth.currentUser, formData.newPassword);
        }
      }
  
      // Update email if changed
      if (formData.email !== user.email) {
        await updateEmail(auth.currentUser, formData.email);
      }
  
      // Update user document in Firestore
      await updateDoc(doc(db, 'fans', user.uid), updates);
  
      setSuccess('Profile updated successfully');
      // Reset password fields after successful update
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              autoComplete="new-password"  // Add this line
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              autoComplete="new-password"  // Add this line
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Following Clubs
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableClubs.map(club => (
                <div
                  key={club.id}
                  onClick={() => {
                    const newSelectedClubs = selectedClubs.includes(club.id)
                      ? selectedClubs.filter(id => id !== club.id)
                      : [...selectedClubs, club.id];
                    setSelectedClubs(newSelectedClubs);
                  }}
                  className={`p-4 border rounded-lg cursor-pointer flex items-center space-x-3 ${
                    selectedClubs.includes(club.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className="font-medium">{club.clubName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;