import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const ClubPlayers = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    shirtNumber: '',
    dateOfBirth: ''
  });

  // List of common football positions
  const positions = [
    'Goalkeeper',
    'Defender',
    'Midfielder',
    'Forward'
  ];

  useEffect(() => {
    fetchPlayers();
  }, [user]);

  const fetchPlayers = async () => {
    try {
      console.log('Fetching players for club:', user.uid);  // Debug log
      const q = query(
        collection(db, 'players'),
        where('clubId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched players:', playersData);  // Debug log
      setPlayers(playersData);
    } catch (error) {
      console.error('Error fetching players:', error);
      setError('Failed to load players: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');  // Clear any previous errors
    console.log('Starting player submission...', formData);  // Debug log
  
    try {
      const playerData = {
        name: formData.name,
        position: formData.position,
        shirtNumber: parseInt(formData.shirtNumber) || 0,
        dateOfBirth: formData.dateOfBirth || null,
        clubId: user.uid,
        createdAt: new Date()  // Add timestamp
      };
  
      console.log('Formatted player data:', playerData);  // Debug log
  
      if (editPlayer) {
        console.log('Updating existing player:', editPlayer.id);
        await updateDoc(doc(db, 'players', editPlayer.id), playerData);
      } else {
        console.log('Adding new player');
        await addDoc(collection(db, 'players'), playerData);
      }
  
      console.log('Player saved successfully');
      
      await fetchPlayers();  // Refresh the players list
      setShowAddModal(false);
      setEditPlayer(null);
      setFormData({
        name: '',
        position: '',
        shirtNumber: '',
        dateOfBirth: ''
      });
    } catch (error) {
      console.error('Error saving player:', error);  // Debug log
      setError(`Failed to save player: ${error.message}`);
      // Keep the modal open when there's an error
    }
  };

  const handleEdit = (player) => {
    setEditPlayer(player);
    setFormData({
      name: player.name,
      position: player.position,
      shirtNumber: player.shirtNumber.toString(),
      dateOfBirth: player.dateOfBirth || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (playerId) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await deleteDoc(doc(db, 'players', playerId));
        await fetchPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
        setError('Failed to delete player');
      }
    }
  };

  if (loading) return <div>Loading players...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Players</h1>
        <button
          onClick={() => {
            setEditPlayer(null);
            setFormData({
              name: '',
              position: '',
              shirtNumber: '',
              dateOfBirth: ''
            });
            setShowAddModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Player
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Players Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shirt #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date of Birth
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player) => (
              <tr key={player.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{player.shirtNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{player.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{player.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(player)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(player.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Player Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editPlayer ? 'Edit Player' : 'Add New Player'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Position
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Position</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shirt Number
                </label>
                <input
                  type="number"
                  value={formData.shirtNumber}
                  onChange={(e) => setFormData({ ...formData, shirtNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editPlayer ? 'Save Changes' : 'Add Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubPlayers;